/**
 * Convert a 2-letter ISO 3166-1 alpha-2 country code to a flag emoji.
 *
 * How it works:
 *   Unicode Regional Indicator Symbols run from U+1F1E6 (🇦) to U+1F1FF (🇿).
 *   Pairing two of them produces a flag: 🇺 + 🇸 = 🇺🇸
 *   The offset from ASCII 'A' (65) to 🇦 (127462) is exactly 127397.
 *   So:  charCode('U') + 127397 = 🇺
 *        charCode('S') + 127397 = 🇸
 *
 * Usage:
 *   flagEmoji('US')  // → '🇺🇸'
 *   flagEmoji('TH')  // → '🇹🇭'
 *   flagEmoji(null)  // → '🏳'
 */
export function flagEmoji(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '🏳'
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('')
}
