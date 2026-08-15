/* FedBid Radar — browser app. Loads data/awards_latest.json (committed daily by the update job). */
const $ = (s) => document.querySelector(s);

const CATS = [
  ['construction', 'Construction'],
  ['it', 'IT & Software'],
  ['professional', 'Professional Services'],
  ['medical', 'Medical & Healthcare'],
  ['transport', 'Transportation & Logistics'],
  ['janitorial', 'Janitorial & Facilities'],
  ['security', 'Security'],
  ['food', 'Food Service'],
  ['training', 'Training & Education'],
  ['supplies', 'Supplies & Equipment'],
];

let awards = [];
let catFilter = '';

function matchCat(a) {
  const hay = ((a.description || '') + ' ' + (a.naics || '') + ' ' + (a.recipient || '')).toLowerCase();
  return CATS.filter(([id, kws]) => {
    const k = {
      construction: ['construction','renovation','remodel','contractor','build','demolition','paving','roofing','framing','drywall','electrical','plumbing','hvac','mechanical','excavation','foundation','concrete','asphalt','facade'],
      it: ['information technology','software','cybersecurity','network','cloud','data center','help desk','systems integration','ai','machine learning','devops','hardware'],
      professional: ['architect','engineering','design','environmental','surveying','consulting','program management','studies','assessments','inspection'],
      medical: ['medical','healthcare','clinic','dental','physician','nursing','laboratory','pharmacy','imaging','x-ray'],
      transport: ['transportation','logistics','freight','shipping','trucking','vehicle','bus','fuel','aviation','maritime','rail','transport'],
      janitorial: ['janitorial','cleaning','custodial','grounds','landscaping','facilities maintenance','pest','waste','snow'],
      security: ['security','guard','surveillance','access control','alarm','patrol'],
      food: ['food service','catering','meal','kitchen','cafeteria','commissary'],
      training: ['training','instruction','course','curriculum','education','workshop','certification'],
      supplies: ['supplies','equipment','furniture','parts','components','manufacturing','fabrication','ppe','uniforms'],
    }[id] || [];
    return k.some(x => hay.includes(x));
  }).map(([id]) => id);
}

function render(list) {
  const el = $('#results');
  $('#count').textContent = list.length + ' awards shown';
  if (!list.length) { el.innerHTML = '<div class="card">No matches — try a broader keyword.</div>'; return; }
  el.innerHTML = list.slice(0, 60).map(a => {
    const tags = matchCat(a).map(c => CATS.find(([id]) => id === c)).filter(Boolean).map(([, label]) => `<span class="tag">${label}</span>`).join('');
    return `<div class="card">
      <div class="top"><span class="recip">${esc(a.recipient)}</span><span class="amt">$${fmt(a.amount)}</span></div>
      <div class="desc">${esc(a.description || '')}</div>
      <div class="tags"><span class="tag">${esc(a.award_id)}</span>${a.naics ? `<span class="tag">NAICS ${a.naics}</span>` : ''}<span class="tag">${esc(a.agency)}</span>${tags}</div>
    </div>`;
  }).join('');
}

const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

async function init() {
  const sel = $('#cat');
  CATS.forEach(([id, label]) => { const o = document.createElement('option'); o.value = id; o.textContent = label; sel.appendChild(o); });
  $('#yr').textContent = new Date().getFullYear();
  try {
    const r = await fetch('data/awards_latest.json', { cache: 'no-store' });
    const j = await r.json();
    awards = j.awards || [];
    $('#count').textContent = awards.length + ' awards (last 7 days)';
  } catch (e) {
    $('#count').textContent = 'data offline — check back after the daily update';
  }
  $('#q').addEventListener('input', apply);
  sel.addEventListener('change', () => { catFilter = sel.value; apply(); });
  apply();
}

function apply() {
  const q = ($('#q').value || '').toLowerCase().trim();
  let list = awards;
  if (catFilter) list = list.filter(a => matchCat(a).includes(catFilter));
  if (q) list = list.filter(a => JSON.stringify(a).toLowerCase().includes(q));
  render(list);
}

init();
