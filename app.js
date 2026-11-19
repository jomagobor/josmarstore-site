'use strict';

const pad = (n) => String(n).padStart(2, '0');
const fmtPrice = (v) => Number(v).toFixed(2).replace('.', ',');
const els = {
  grid:        document.getElementById('grid'),
  gridAll:     document.getElementById('gridAll'),
  catsBar:     document.getElementById('catsBar'),
  contador:    document.getElementById('contador'),
  categoriasGrid: document.getElementById('categoriasGrid'),
  busca:       document.getElementById('busca'),
};

let produtos = [];
let currentCat = 'all';
let currentQuery = '';

function flatten(arr) {
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item)) out.push(...flatten(item));
    else if (item && typeof item === 'object' && item.id) out.push(item);
  }
  return out;
}

function loadData() {
  const raw = window.__PRODUCTOS;
  if (Array.isArray(raw) && raw.length) {
    produtos = flatten(raw);
  } else {
    produtos = [];
  }
}

const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const escapeAttr = (s) => escapeHTML(s).replace(/"/g, '&quot;');

function renderCard(p) {
  const price = p.preco != null ? p.preco : null;
  const dis = (p.desconto && String(p.desconto) !== '0') ? p.desconto : null;
  const discBlock = dis ? `<span class="card-badge">-${dis}%</span>` : '';
  const priceBlock = price != null
    ? `<span class="card-price">R$ <span class="num">${fmtPrice(price)}</span></span>${p.preco_original ? `<span class="card-old">R$ ${fmtPrice(p.preco_original)}</span>` : ''}`
    : '';
  const sold = p.vendidos ? `<span class="sold-bar"><strong>${escapeHTML(p.vendidos.replace('Vendido(s)','vend.'))}</strong></span>` : '';
  return `
    <a class="card fadeup" href="${escapeAttr(p.link)}" rel="noopener sponsored nofollow" target="_blank" aria-label="${escapeAttr(p.nome)} — abrir na Shopee">
      <div class="card-img">${discBlock}<img src="${escapeAttr(p.imagem)}" alt="${escapeAttr(p.nome)}" loading="lazy" onerror="this.onerror=null;this.src='placeholder.svg'" /></div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(p.nome)}</h3>
        <div class="card-meta">${sold}<span>Shopee</span></div>
        <div class="card-price-row">${priceBlock}</div>
        <span class="card-cta">Ver oferta</span>
      </div>
    </a>`;
}

function applyFilters(source) {
  let arr = source.slice();
  if (currentCat !== 'all') arr = arr.filter(p => p.categoria === currentCat);
  if (currentQuery) {
    const q = currentQuery.toLowerCase();
    arr = arr.filter(p => p.nome.toLowerCase().includes(q) || (p.categoria||'').toLowerCase().includes(q) || String(p.badge||'').toLowerCase().includes(q));
  }
  return arr;
}

function render() {
  const filtered = applyFilters(produtos);
  if (els.grid) els.grid.innerHTML = filtered.slice(0, 12).map(renderCard).join('');
  if (els.gridAll) els.gridAll.innerHTML = filtered.map(renderCard).join('');
  if (els.contador) els.contador.textContent = `${filtered.length} ${filtered.length === 1 ? 'oferta' : 'ofertas'} — preço real Shopee`;
}

const CATEGORIAS = [
  { id: 'all',         label: 'Todas' },
  { id: 'cozinha',     label: 'Cozinha' },
  { id: 'limpeza',     label: 'Limpeza' },
  { id: 'banho-e-cama',label: 'Banho e cama' },
  { id: 'casa',        label: 'Casa' },
  { id: 'moda',        label: 'Moda' },
  { id: 'tech',        label: 'Tech' },
  { id: 'alimentos',   label: 'Alimentos' },
];

function renderCats() {
  const counts = {};
  for (const c of CATEGORIAS) {
    counts[c.id] = c.id === 'all' ? produtos.length : produtos.filter(p => p.categoria === c.id).length;
  }
  const catDefs = CATEGORIAS.filter(c => c.id === 'all' || counts[c.id] > 0);
  if (els.catsBar) {
    els.catsBar.innerHTML = catDefs.map(c =>
      `<button class="chip ${c.id === currentCat ? 'active' : ''}" role="tab" aria-selected="${c.id === currentCat ? 'true' : 'false'}" data-cat="${c.id}" type="button">${c.label}<span class="chip-count" style="opacity:.7;font-weight:500;margin-left:4px">${counts[c.id]}</span></button>`
    ).join('');
    els.catsBar.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCat = btn.dataset.cat || 'all';
        els.catsBar.querySelectorAll('.chip').forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        render();
      });
    });
  }
  if (els.categoriasGrid) {
    const keys = CATEGORIAS.filter(c => c.id !== 'all' && counts[c.id] > 0).map(c => c.id);
    els.categoriasGrid.innerHTML = keys.map(k => {
      const metaLabel = (CATEGORIAS.find(c => c.id === k) || {}).label || k;
      const sample = produtos.find(p => p.categoria === k);
      const img = sample ? sample.imagem : '';
      const featured = produtos.find(p => p.categoria === k && p.desconto) || sample;
      const featuredPrice = featured?.preco != null ? 'R$ ' + fmtPrice(featured.preco) : '';
      return `
        <a class="card fadeup" href="#ofertas" aria-label="Ver ${escapeAttr(metaLabel)}: ${counts[k]} ofertas">
          <div class="card-img"><img src="${escapeAttr(img)}" alt="${escapeAttr(metaLabel)}" loading="lazy" onerror="this.onerror=null;this.src='placeholder.svg'" /></div>
          <div class="card-body">
            <h3 class="card-title" style="min-height:0">${escapeHTML(metaLabel)}</h3>
            <p class="card-meta">${counts[k]} ofertas</p>
            <div class="card-price-row"><span class="card-price">${escapeHTML(featuredPrice)}</span></div>
            <span class="card-cta">Ver ofertas</span>
          </div>
        </a>`;
    }).join('');
  }
}

if (els.busca) {
  let t;
  els.busca.addEventListener('input', (ev) => {
    clearTimeout(t);
    t = setTimeout(() => { currentQuery = (ev.target.value || '').trim(); render(); }, 150);
  });
}

// Copy-to-clipboard for coupon codes
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const code = btn.dataset.copy;
    if (!code) return;
    try { await navigator.clipboard.writeText(code); const orig = btn.textContent; btn.textContent = 'Copiado!'; setTimeout(() => btn.textContent = orig, 1500); }
    catch (_) { console.warn('clipboard blocked'); }
  });
});

loadData();
render();
renderCats();
