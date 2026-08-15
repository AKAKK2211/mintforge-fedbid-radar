// FedBid Radar — USAspending.gov data fetcher (free, no API key)
// Pulls recent federal contract awards, normalizes, and writes data/awards_latest.json
// Usage: node usa_spending_fetch.mjs [days_back=7]
import fs from 'node:fs';
import path from 'node:path';

const daysBack = Number(process.argv[2] || 7);
const end = new Date();
const start = new Date(Date.now() - daysBack * 86400e3);
const iso = (d) => d.toISOString().slice(0, 10);

const payload = {
  filters: {
    award_type_codes: ['A', 'B', 'C', 'D'], // contracts
    time_period: [{ start_date: iso(start), end_date: iso(end) }],
  },
  fields: [
    'Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency',
    'Description', 'Start Date', 'End Date', 'generated_internal_id', 'NAICS Code',
  ],
  limit: 100,
  page: 1,
};

const out = [];
let page = 1;
for (; page <= 5; page++) {
  payload.page = page;
  const res = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) { console.error('API error', res.status); break; }
  const data = await res.json();
  out.push(...data.results);
  if (!data.page_metadata?.hasNext) break;
  await new Promise(r => setTimeout(r, 400));
}

const normalized = out.map(r => ({
  id: r['generated_internal_id'],
  award_id: r['Award ID'],
  recipient: r['Recipient Name'],
  amount: r['Award Amount'],
  agency: r['Awarding Agency'],
  naics: r['NAICS Code'] || null,
  description: (r['Description'] || '').slice(0, 300),
  start_date: r['Start Date'],
  end_date: r['End Date'],
}));

const dir = path.join(process.cwd(), 'data');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'awards_latest.json'), JSON.stringify({ fetched_at: new Date().toISOString(), count: normalized.length, awards: normalized }, null, 2));
console.log(`Fetched ${normalized.length} awards (${daysBack}d window).`);
normalized.slice(0, 5).forEach(a => console.log(`  ${a.award_id} | $${a.amount.toLocaleString()} | ${a.recipient} | ${(a.description || '').slice(0, 60)}`));
