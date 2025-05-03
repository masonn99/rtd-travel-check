import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const data = require('../data.json');
const today = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://rtd-travel-check.vercel.app</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ${data.map(country => `
  <url>
    <loc>https://rtd-travel-check.vercel.app/country/${encodeURIComponent(country.country)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;

const dirname = path.dirname(new URL(import.meta.url).pathname);
fs.writeFileSync(path.join(dirname, '../public/sitemap.xml'), sitemap);
console.log('Sitemap generated successfully');
