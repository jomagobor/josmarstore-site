'use strict';

const state = { categoria: 'all', busca: '' };
let produtos = [];

const el = (sel, ctx = document) => ctx.querySelector(sel);
const all = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const fmtBRL = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

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
  renderTop3();
  renderGrid();
}

function renderTop3() {
  const top3 = produtos
    .filter((p) => p.vendidos.includes('mil'))
    .slice(0, 3);
  el('#top3List').innerHTML = top3.map((p) => `
    <li class="top-item">
      <a class="top-card" href="${p.link}" rel="noopener sponsored nofollow" target="_blank" aria-label="Ver oferta de ${escapeHTML(p.nome)} na Shopee">
        <img src="${p.imagem}" alt="" width="140" height="140" loading="lazy" onerror="this.onerror=null;this.src='placeholder.svg'" />
        <span class="top-text">
          <span class="top-name">${escapeHTML(p.nome)}</span>
          <span class="top-sales">${escapeHTML(p.vendidos)} vendidos</span>
        </span>
        <span class="top-price">R$ <span class="fig">${fmtBRL(p.preco).replace(/R\$\s*/, '').trim()}</span></span>
      </a>
    </li>`).join('');
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
  el('#contador').textContent = `${lista.length} ${lista.length === 1 ? 'oferta' : 'ofertas'}`;
  el('#vazio').hidden = lista.length !== 0;

  el('#grid').innerHTML = lista.map((p) => `
    <a class="offer-card" href="${p.link}" rel="noopener sponsored nofollow" target="_blank" aria-label="Ver oferta de ${escapeHTML(p.nome)} na Shopee">
      <span class="offer-media">
        ${p.desconto ? `<span class="offer-discount">${escapeHTML(p.desconto)}</span>` : ''}
        <img src="${p.imagem}" alt="${escapeHTML(p.nome)}" width="220" height="220" loading="lazy" onerror="this.onerror=null;this.src='placeholder.svg'" />
      </span>
      <span class="offer-body">
        <span class="offer-name">${escapeHTML(p.nome)}</span>
        <span class="offer-sales">${escapeHTML(p.vendidos)} vendidos</span>
        <span class="offer-foot">
          <span class="offer-price">R$ <span class="fig">${fmtBRL(p.preco).replace(/R\$\s*/, '').trim()}</span></span>
          <span class="offer-btn">Ver oferta</span>
        </span>
      </span>
    </a>`).join('');
}

all('.filter').forEach((btn) =>
  btn.addEventListener('click', () => {
    state.categoria = btn.dataset.cat;
    all('.filter').forEach((b) => b.classList.toggle('active', b === btn));
    all('.filter').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
    renderGrid();
  })
);

let debounce;
el('#busca').addEventListener('input', (e) => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    state.busca = e.target.value;
    renderGrid();
  }, 150);
});

const form = el('#newsletterForm');
const note = el('#newsMsg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const tel = el('#telefone');
  const bruto = tel.value.trim().replace(/\D/g, '');
  if (bruto.length < 8) {
    note.textContent = 'Digite um número válido, com DDD.';
    tel.focus();
    return;
  }
  note.textContent = 'Você entrou na lista. O próximo achado chega no seu WhatsApp.';
  tel.value = '';
});

const qp = new URLSearchParams(window.location.search).get('q');
if (qp) {
  el('#busca').value = qp;
  state.busca = qp;
}

carregar();
