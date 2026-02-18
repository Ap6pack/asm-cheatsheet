/**
 * Generate static assets at build time:
 * - search-data.json for client-side search
 * - sitemap.xml for SEO
 * Run with: npx tsx scripts/generate-search-data.ts
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import {
  getSearchEntries,
  getAllModules,
  getAllWorkflows,
  getAllScenarios,
  getAllCaseStudies,
  getAllTools,
} from '../src/lib/content/loader';

const baseUrl = 'https://asm-cheatsheet.vercel.app';

function sitemapEntry(url: string, priority: number): string {
  return `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  // Generate search data
  const entries = await getSearchEntries();
  const searchPath = resolve(__dirname, '../public/search-data.json');
  writeFileSync(searchPath, JSON.stringify(entries));
  console.log(`Generated search-data.json with ${entries.length} entries`);

  // Generate sitemap
  const urls: string[] = [];
  const staticPages = ['', '/learn', '/commands', '/tools', '/workflows', '/scenarios', '/case-studies', '/guides'];
  for (const page of staticPages) {
    urls.push(sitemapEntry(`${baseUrl}${page}`, page === '' ? 1 : 0.8));
  }

  const modules = await getAllModules();
  for (const m of modules) urls.push(sitemapEntry(`${baseUrl}/learn/module-${m.id}`, 0.6));

  const workflows = await getAllWorkflows();
  for (const wf of workflows) urls.push(sitemapEntry(`${baseUrl}/workflows/${wf.slug}`, 0.6));

  const scenarios = await getAllScenarios();
  for (const sc of scenarios) urls.push(sitemapEntry(`${baseUrl}/scenarios/${sc.slug}`, 0.6));

  const caseStudies = await getAllCaseStudies();
  for (const cs of caseStudies) urls.push(sitemapEntry(`${baseUrl}/case-studies/${cs.slug}`, 0.5));

  const tools = await getAllTools();
  for (const t of tools) urls.push(sitemapEntry(`${baseUrl}/tools/${t.slug}`, 0.6));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const sitemapPath = resolve(__dirname, '../public/sitemap.xml');
  writeFileSync(sitemapPath, sitemap);
  console.log(`Generated sitemap.xml with ${urls.length} URLs`);
}

main().catch((err) => {
  console.error('Failed to generate static assets:', err);
  process.exit(1);
});
