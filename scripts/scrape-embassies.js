/**
 * Embassy scraper — pulls data from Wikidata + OpenStreetMap for all
 * countries in data.json, then writes embassies.json to the project root.
 *
 * Usage:  node scripts/scrape-embassies.js
 * Output: embassies.json (one entry per data.json country)
 */

import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const visaData     = JSON.parse(readFileSync(join(__dirname, '../data.json'), 'utf-8'))
const supplements  = JSON.parse(readFileSync(join(__dirname, 'embassy-supplements.json'), 'utf-8'))

// Build supplement index for O(1) lookup
const supplementIndex = Object.fromEntries(supplements.map(s => [s.country, s]))

// ─── Name normalisation ────────────────────────────────────────────────────
// Map data.json names → common English names used by Wikidata / OSM

const NAME_OVERRIDES = {
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  'Korea, Republic of':                                  'South Korea',
  "Lao People's Democratic Republic":                    'Laos',
  'Viet Nam':                                            'Vietnam',
  'Iran, Islamic Republic of':                           'Iran',
  'Moldova, Republic of':                                'Moldova',
  'Taiwan, Province of China':                           'Taiwan',
  'United States of America':                            'United States',
  'Türkiye':                                             'Turkey',
  'Eswatini':                                            'Eswatini',   // formerly Swaziland
  'Cook Islands':                                        'Cook Islands',
  'Faroe Islands':                                       'Faroe Islands',
  'French Polynesia':                                    'French Polynesia',
  'Hong Kong':                                           'Hong Kong',
  'Macao':                                               'Macau',
}

const normalize = name => NAME_OVERRIDES[name] ?? name

// ─── Wikidata ──────────────────────────────────────────────────────────────

async function fetchWikidata() {
  console.log('📡 Querying Wikidata SPARQL...')

  // Grab embassy + consulate-general + consulate types all in one shot
  // Note: country of origin isn't a reliable property — we parse it from itemLabel instead
  const query = `
SELECT DISTINCT ?item ?itemLabel ?website ?phone ?address WHERE {
  VALUES ?type { wd:Q3917681 wd:Q7843791 wd:Q134118 }
  ?item wdt:P31 ?type .
  ?item wdt:P17 wd:Q30 .
  OPTIONAL { ?item wdt:P856 ?website }
  OPTIONAL { ?item wdt:P1329 ?phone }
  OPTIONAL { ?item wdt:P6375 ?address }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
  `.trim()

  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query)
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RTDTravelCheck/1.0 (https://github.com/masonn99/rtd-travel-check)',
      'Accept': 'application/sparql-results+json',
    }
  })

  if (!res.ok) throw new Error(`Wikidata returned HTTP ${res.status}`)

  const { results } = await res.json()
  console.log(`   → ${results.bindings.length} Wikidata rows returned`)
  return results.bindings
}

// ─── OpenStreetMap Overpass ────────────────────────────────────────────────

const OVERPASS_MIRRORS = [
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

async function fetchOSM() {
  console.log('🗺️  Querying OpenStreetMap Overpass API...')

  const query = `
[out:json][timeout:90];
(
  node["amenity"="embassy"](24.0,-180.0,72.0,-60.0);
  way["amenity"="embassy"](24.0,-180.0,72.0,-60.0);
  relation["amenity"="embassy"](24.0,-180.0,72.0,-60.0);
);
out center tags;
  `.trim()

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      console.log(`   trying ${mirror.replace('https://', '')}...`)
      const res = await fetch(mirror, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      })
      if (!res.ok) { console.log(`   HTTP ${res.status} — trying next mirror`); continue }
      const { elements } = await res.json()
      console.log(`   → ${elements.length} OSM elements returned`)
      return elements
    } catch (e) {
      console.log(`   failed (${e.message}) — trying next mirror`)
    }
  }

  console.log('   ⚠️  All Overpass mirrors failed — continuing with Wikidata only')
  return []
}

// ─── Merge & match ─────────────────────────────────────────────────────────

// Parse "Embassy of Albania, Washington D.C." → "Albania"
// Handles: Embassy of X, Consulate of X, Consulate General of X, Mission of X
function parseCountryFromLabel(label) {
  if (!label) return null
  const match = label.match(
    /(?:Embassy|Consulate(?:\s+General)?|Diplomatic\s+Mission|Mission)\s+of\s+(?:the\s+)?([^,]+?)(?:\s+in\s+|\s*,)/i
  )
  if (match) return match[1].trim()
  // Fallback: "British Embassy" style
  const alt = label.match(/^(.+?)\s+Embassy/i)
  if (alt) return alt[1].trim()
  return null
}

function buildWikidataIndex(rows) {
  // country name (parsed from label) → best embassy row
  const index = {}

  for (const row of rows) {
    const label   = row.itemLabel?.value ?? ''
    const country = parseCountryFromLabel(label)
    if (!country) continue

    const entry = {
      name:    label,
      website: row.website?.value ?? '',
      phone:   row.phone?.value   ?? '',
      address: row.address?.value ?? '',
      source:  'wikidata',
    }

    // Keep the entry with the most data (embassy > consulate)
    const existing = index[country]
    const score = e => (e.website ? 2 : 0) + (e.phone ? 1 : 0) + (e.address ? 1 : 0)
    if (!existing || score(entry) > score(existing)) {
      index[country] = entry
    }
  }

  return index
}

function buildOSMIndex(elements) {
  // "country" tag → best element
  const index = {}

  for (const el of elements) {
    const t = el.tags ?? {}
    // OSM uses `country` or `flag:country` or embassy name
    const country = t['country'] ?? t['diplomatic:country'] ?? null
    if (!country) continue

    const entry = {
      name:    t.name ?? t['name:en'] ?? '',
      website: t.website ?? t.url ?? '',
      phone:   t.phone ?? t['contact:phone'] ?? '',
      address: [t['addr:housenumber'], t['addr:street'], t['addr:city'], t['addr:state']]
                 .filter(Boolean).join(' '),
      source: 'osm',
    }

    const score = e => (e.website ? 2 : 0) + (e.phone ? 1 : 0) + (e.address ? 1 : 0)
    if (!index[country] || score(entry) > score(index[country])) {
      index[country] = entry
    }
  }

  return index
}

// Try a list of possible keys against the index
function lookup(index, ...keys) {
  for (const key of keys) {
    if (key && index[key]) return index[key]
    // Case-insensitive fallback
    if (key) {
      const lower = key.toLowerCase()
      const found = Object.keys(index).find(k => k.toLowerCase() === lower)
      if (found) return index[found]
    }
  }
  return null
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏛️  RTD Embassy Scraper`)
  console.log(`   Processing ${visaData.length} countries from data.json\n`)

  // Fetch both sources in parallel
  const [wikidataRows, osmElements] = await Promise.all([
    fetchWikidata(),
    fetchOSM(),
  ])

  const wdIndex  = buildWikidataIndex(wikidataRows)
  const osmIndex = buildOSMIndex(osmElements)

  console.log(`\n🔗 Matching countries...\n`)

  const results = []
  const notFound = []

  for (const entry of visaData) {
    const rawName  = entry.country
    const normName = normalize(rawName)

    // Priority: Wikidata > OSM > manual supplement
    const wd  = lookup(wdIndex,  normName, rawName)
    const osm = lookup(osmIndex, normName, rawName)
    const sup = supplementIndex[rawName] || supplementIndex[normName] || null

    const website = wd?.website  || osm?.website  || sup?.website  || ''
    const phone   = wd?.phone    || osm?.phone    || sup?.phone    || ''
    const address = osm?.address || wd?.address   || sup?.address  || ''
    const name    = wd?.name     || osm?.name     || sup?.embassy_name || `${normName} Embassy`
    const note    = sup?.note || ''
    const sources = [wd ? 'wikidata' : null, osm ? 'osm' : null, sup ? 'manual' : null].filter(Boolean)

    const record = {
      country:       rawName,
      embassy_name:  name,
      website,
      phone,
      address,
      note,
      sources,
      visa_required: entry.visaRequirement,
    }

    results.push(record)

    const hasData = website || phone || address
    if (hasData) {
      console.log(`  ✅ ${normName.padEnd(40)} ${website ? '🌐' : '  '} ${phone ? '📞' : '  '} ${address ? '📍' : '  '}`)
    } else {
      notFound.push(normName)
      console.log(`  ⚠️  ${normName.padEnd(40)} no data found`)
    }
  }

  // Summary
  const withWebsite = results.filter(r => r.website).length
  const withPhone   = results.filter(r => r.phone).length
  const withAddress = results.filter(r => r.address).length

  console.log(`\n📊 Results:`)
  console.log(`   ${results.length} total countries`)
  console.log(`   ${withWebsite} have a website`)
  console.log(`   ${withPhone}   have a phone number`)
  console.log(`   ${withAddress} have an address`)
  console.log(`   ${notFound.length} found no data`)

  if (notFound.length > 0) {
    console.log(`\n⚠️  No data for: ${notFound.join(', ')}`)
  }

  // Write output
  const outPath = join(__dirname, '../embassies.json')
  writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(`\n✅ Written to embassies.json\n`)
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message)
  process.exit(1)
})
