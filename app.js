'use strict';

const state = { categoria: 'all', busca: '' };
let produtos = [];

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const formatBRL = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function carregarProdutos() {
  try {
    const res = await fetch('products.json?v=' + Date.now());
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    produtos = await res.json();
    render();
  } catch (err) {
    $('#grid').innerHTML = '<p class="empty">Não foi possível carregar as ofertas. Tente atualizar a página.</p>';
    console.error(err);
  }
}

function filtrar() {
  const q = state.busca.trim().toLowerCase();
  return produtos.filter((p) => {
    const catOk = state.categoria === 'all' || p.categoria === state.categoria;
    if (!catOk) return false;
    if (!q) return true;
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.badge || '').toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    );
  });
}

function render() {
  const lista = filtrar();
  const grid = $('#grid');
  $('#contador').textContent = `${lista.length} ${lista.length === 1 ? 'oferta' : 'ofertas'}`;
  $('#vazio').hidden = lista.length !== 0;

  grid.innerHTML = lista.map((p) => `
    <a class="card" href="${p.link}" target="_blank" rel="noopener sponsored nofollow" aria-label="Ver oferta de ${escapeHtml(p.nome)} na JosmarStore">
      <div class="card-media">
        ${p.badge ? `<span class="badge${p.badge === 'Mais vendido' || p.badge === 'Fixado' ? ' green' : ''}">${escapeHtml(p.badge)}</span>` : ''}
        ${p.desconto ? `<span class="discount">${escapeHtml(p.desconto)}</span>` : ''}
        <img loading="lazy" src="${p.imagem}" alt="${escapeHtml(p.nome)}" onerror="this.onerror=null;this.src='placeholder.svg'" />
      </div>
      <div class="card-body">
        <h3>${escapeHtml(p.nome)}</h3>
        <small class="vendidos">${escapeHtml(p.vendidos)} vendidos na Shopee</small>
        <div class="price-row">
          <span class="price">${formatBRL(p.preco)}<small>preço na oferta</small></span>
          <span class="card-btn">Ver oferta →</span>
        </div>
      </div>
    </a>
  `).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Filtros
$$('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.categoria = btn.dataset.cat;
    $$('.filter').forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});

// Busca com debounce
let debounce;
$('#busca').addEventListener('input', (e) => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    state.busca = e.target.value;
    render();
  }, 150);
});

// Newsletter (captura local — integre depois com MailerLite/Kiwify/Zapier)
const form = $('#newsletterForm');
const msg = $('#newsMsg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const telefone = $('#telefone').value.trim();
  const salvo = JSON.parse(localStorage.getItem('josmarstore_leads') || '[]');
  salvo.push({ telefone, em: new Date().toISOString() });
  localStorage.setItem('josmarstore_leads', JSON.stringify(salvo));
  form.querySelector('input').value = '';
  msg.textContent = 'Valeu! Você entrou na lista (armazenada neste navegador). Enviaremos as melhores ofertas no WhatsApp.';
});

// Ano no rodapé
$('#ano').textContent = new Date().getFullYear();

// Suporte a busca via query string: ?q=termo
const qp = new URLSearchParams(window.location.search).get('q');
if (qp) {
  $('#busca').value = qp;
  state.busca = qp;
}

carregarProdutos();
