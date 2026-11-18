'use strict';

const state = { categoria: 'all', busca: '' };
let produtos = [];

const el = (sel, ctx = document) => ctx.querySelector(sel);
const all = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const fmtBRL = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function escapeAttr(s) { return escapeHTML(s).replace(/"/g, '&quot;'); }

async function carregar() {
  try {
    produtos = await fetch('products.json?v=' + Date.now()).then((r) => (r.ok ? r.json() : Promise.reject()));
  } catch (err) {
    produtos = window.__PRODUCTOS ? [...window.__PRODUCTOS] : [];
  }
  if (!produtos.length) {
    el('#grid').innerHTML = '<p class="empty">Não foi possível carregar as ofertas.</p>';
    return;
  }
  renderCarrossel();
  renderDestaque();
  renderCategory('casa', 'gridCasa');
  renderCategory('alimentos', 'gridAlimentos');
  renderCategory('moda', 'gridModa');
  renderCategory('tech', 'gridTech');
  renderGrid();
}

// rotate "Destaques de hoje" deterministically by day-of-year
function renderCarrossel() {
  const hot = produtos.filter((p) => p.preco != null).slice(0, 8);
  if (!hot.length) return;
  const d = new Date();
  const start = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % hot.length;
  const ordered = [...hot.slice(start), ...hot.slice(0, start)];
  el('#carousel').innerHTML = ordered.slice(0, 6).map((p) => `
    <a class="carousel-card" href="${escapeAttr(p.link)}" rel="noopener sponsored nofollow" target="_blank" aria-label="Ver oferta de ${escapeHTML(p.nome)} na Shopee">
      ${p.desconto ? `<span class="carousel-badge">${escapeHTML(p.desconto)}</span>` : ''}
      <span class="carousel-media"><img src="${escapeAttr(p.imagem)}" alt="${escapeAttr(p.nome)}" width="260" height="260" loading="lazy" onerror="this.onerror=null;this.src='placeholder.svg'" /></span>
      <span class="carousel-body">
        <span class="carousel-name">${escapeHTML(p.nome)}</span>
        <span class="carousel-sales">${p.vendidos ? escapeHTML(p.vendidos) + ' vendidos' : 'Oferta disponível'}</span>
        <span class="carousel-price">R$ <span class="fig">${Number(p.preco).toFixed(2).replace('.', ',')}</span><small>a partir de</small></span>
      </span>
    </a>`).join('');

  // auto-advance carousel
  let i = 0;
  const track = el('#carousel');
  const step = () => {
    const card = track.querySelector('.carousel-card');
    if (!card) return;
    const w = card.offsetWidth + 20;
    i = (i + 1) % Math.max(1, Math.floor(track.scrollWidth / Math.max(1, w)));
    track.scrollTo({ left: i * w, behavior: 'smooth' });
  };
  const id = setInterval(step, 4500);
  track.addEventListener('mouseenter', () => clearInterval(id));
  track.addEventListener('mouseleave', () => setInterval(step, 4500));
}

function renderDestaque() {
  const hot = produtos.filter((p) => p.preco != null).slice(0, 8);
  el('#destaqueGrid').innerHTML = hot.map((p) => `
    <a class="offer-card destaque" href="${escapeAttr(p.link)}" rel="noopener sponsored nofollow" target="_blank" aria-label="Ver oferta de ${escapeHTML(p.nome)} na Shopee">
      <span class="offer-media">
        ${p.desconto ? `<span class="offer-discount">${escapeHTML(p.desconto)}</span>` : ''}
        <img src="${escapeAttr(p.imagem)}" alt="${escapeAttr(p.nome)}" width="260" height="260" loading="lazy" onerror="this.onerror=null;this.src='placeholder.svg'" />
      </span>
      <span class="offer-body">
        <span class="offer-name">${escapeHTML(p.nome)}</span>
        <span class="offer-sales">${p.vendidos ? escapeHTML(p.vendidos) + ' vendidos' : 'Oferta disponível'}</span>
        <span class="offer-foot">
          <span class="offer-price">R$ <span class="fig">${Number(p.preco).toFixed(2).replace('.', ',')}</span></span>
          <span class="offer-btn">Ver oferta</span>
        </span>
      </span>
    </a>`).join('');
}

function renderCategory(cat, containerId) {
  const catProducts = produtos.filter((p) => p.categoria === cat);
  const slice = catProducts.slice(0, 4);
  el('#' + containerId).innerHTML = slice.map((p) => `
    <a class="offer-card" href="${escapeAttr(p.link)}" rel="noopener sponsored nofollow" target="_blank" aria-label="Ver oferta de ${escapeHTML(p.nome)} na Shopee">
      <span class="offer-media">
        ${p.desconto ? `<span class="offer-discount">${escapeHTML(p.desconto)}</span>` : ''}
        <img src="${escapeAttr(p.imagem)}" alt="${escapeAttr(p.nome)}" width="260" height="260" loading="lazy" onerror="this.onerror=null;this.src='placeholder.svg'" />
      </span>
      <span class="offer-body">
        <span class="offer-name">${escapeHTML(p.nome)}</span>
        <span class="offer-sales">${p.vendidos ? escapeHTML(p.vendidos) + ' vendidos' : 'Ver na Shopee'}</span>
        <span class="offer-foot">
          <span class="offer-price">${p.preco != null ? 'R$ <span class="fig">' + Number(p.preco).toFixed(2).replace('.', ',') + '</span>' : '<span class="price-unknown">Ver na Shopee</span>'}</span>
          <span class="offer-btn">Ver oferta</span>
        </span>
      </span>
    </a>`).join('');
  if (!slice.length) el('#' + containerId).innerHTML = '<p class="empty">Nada por aqui agora.</p>';
}

function filtrar() {
  const q = state.busca.trim().toLowerCase();
  return produtos.filter((p) => {
    if (state.categoria !== 'all' && p.categoria !== state.categoria) return false;
    if (!q) return true;
    return p.nome.toLowerCase().includes(q) || (p.badge || '').toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
  });
}

function renderGrid() {
  const lista = filtrar();
  const elGrid = el('#grid');
  if (!elGrid) return;
  const counterEl = el('#contador');
  if (counterEl) counterEl.textContent = `${lista.length} ${lista.length === 1 ? 'oferta' : 'ofertas'}`;
  el('#vazio').hidden = lista.length !== 0;
  elGrid.innerHTML = lista.map((p) => `
    <a class="offer-card" href="${escapeAttr(p.link)}" rel="noopener sponsored nofollow" target="_blank" aria-label="Ver oferta de ${escapeHTML(p.nome)} na Shopee">
      <span class="offer-media">
        ${p.desconto ? `<span class="offer-discount">${escapeHTML(p.desconto)}</span>` : ''}
        <img src="${escapeAttr(p.imagem)}" alt="${escapeAttr(p.nome)}" width="220" height="220" loading="lazy" onerror="this.onerror=null;this.src='placeholder.svg'" />
      </span>
      <span class="offer-body">
        <span class="offer-name">${escapeHTML(p.nome)}</span>
        <span class="offer-sales">${p.vendidos ? escapeHTML(p.vendidos) + ' vendidos' : 'Clique para ver na Shopee'}</span>
        <span class="offer-foot">
          <span class="offer-price">${p.preco != null ? 'R$ <span class="fig">' + Number(p.preco).toFixed(2).replace('.', ',') + '</span>' : '<span class="price-unknown">Ver na Shopee</span>'}</span>
          <span class="offer-btn">Ver oferta</span>
        </span>
      </span>
    </a>`).join('');
}

all('.filter').forEach((btn) =>
  btn.addEventListener('click', () => {
    state.categoria = btn.dataset.cat;
    all('.filter').forEach((b) => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
    renderGrid();
  })
);

const busca = el('#busca');
if (busca) {
  let debounce;
  busca.addEventListener('input', (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { state.busca = e.target.value; renderGrid(); }, 150);
  });
}

const form = el('#newsletterForm');
if (form) {
  const note = el('#newsMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tel = el('#telefone');
    const bruto = tel.value.trim().replace(/\D/g, '');
    if (bruto.length < 8) { note.textContent = 'Digite um número válido com DDD.'; tel.focus(); return; }
    note.textContent = 'Você entrou na lista. O próximo achado chega no seu WhatsApp.';
    tel.value = '';
  });
}

const qp = new URLSearchParams(window.location.search).get('q');
if (qp) { const b = el('#busca'); if (b) { b.value = qp; state.busca = qp; } }

carregar();
