# JosmarStore — Site de Achados e Ofertas Shopee

Vitrine independente de ofertas e afiliados da Shopee, construída do zero em HTML/CSS/JS estático — pronto para hospedar de graça.

## O que já está pronto

- Design moderno (dark theme, gradiente, marquee, cards com badges e descontos reais)
- Busca instantânea (Ctrl+K não necessário — o campo já filtra) + filtros por categoria
- 10 ofertas reais extraídas da sua storefront JosmarStore (nome, preço, desconto, vendidos, imagens)
- SEO estruturado (Schema.org WebSite + SearchAction), Open Graph, canônico, sitemap e favicon próprios
- Divulgação honesta: aviso de afiliado visível (compliance com regras Shopee/AdSense/conselhos)
- Newsletter com captura local (localStorage) — pronta para integrar com MailerLite/Kiwify/Zapier
- Botão de WhatsApp e integração com a sua loja collshp.com/josmarstore
- Responsivo, foco em mobile, contraste e acessibilidade (`aria`, `role`, `prefers-reduced-motion`)

## Como ver no navegador (local)

```bash
cd "JosmarStore site"
python3 -m http.server 8080
# abra http://127.0.0.1:8080
```

## Como hospedar grátis (recomendado)

### Opção 1 — Cloudflare Pages (mais rápido, grátis)
1. Crie uma conta em https://pages.cloudflare.com
2. Conecte um repositório GitHub novo/importado contendo estes arquivos
3. Build output = raiz. Pronto: você ganha `https://josmarstore.pages.dev`

### Opção 2 — Netlify
1. Conta em https://app.netlify.com
2. Arraste a pasta `JosmarStore site` no deploy (drag & drop)
3. URL grátis: `https://josmarstore.netlify.app`

### Opção 3 — GitHub Pages
1. Repositório público com os arquivos na raiz
2. Settings → Pages → Branch: main / root

## Como atualizar ofertas

Edite apenas `products.json` — o resto (layout, filtros, busca, SEO) já funciona.
Adicione/altere itens mantendo o padrão:

```json
{ "id":"p09", "nome":"Produto", "preco": 29.90, "desconto":"-20%", "vendidos":"1 mil+", "categoria":"casa", "badge":"Novo", "imagem":"https://...", "link":"https://collshp.com/josmarstore?view=storefront" }
```

Categorias aceitas: `casa`, `moda`, `alimentos`, `tech`.

## Caminho para virar o maior agregador de ofertas do Brasil (honestamente)

Fase 1 (agora): sair com a JosmarStore no ar, divulgando 1–2 achados por dia no
YouTube Shorts/Reels/TikTok, sempre com link para esta vitrine.

Fase 2 (próximos 30–60 dias): acrescentar um coletor de ofertas dos outros
marketplaces (Mercado Livre, Amazon, Shopee Extra) gravando em `products.json` —
essa parte pode ser automatizada depois com um script.

Fase 3: domínio próprio `.com.br` (registro.br, ~R$ 40/ano) + e-mail.

Fase 4: tráfego orgânico + Newsletter WhatsApp → crescer followers e renegociar
as melhores comissões de afiliados.

## Curadoria é sua responsabilidade

Antes de publicar um produto, confira:
- ✅ preço real e desconto de verdade (não fake anchor price)
- ✅ reputação do vendedor na Shopee
- ✅ produto disponível para entrega
- ✅ imagem sem marca d'água/violação de marca
- ✅ divulgação de afiliado visível (já está incluída no site)

## Observação sobre links

Cada card hoje aponta para a sua storefront (`collshp.com/josmarstore`).
Quando tiver os links de afiliado individuais de cada produto, basta substituir
o campo `"link"` em `products.json` — o site não precisa de mais nada.

---

Arquivo: `JosmarStore site/` dentro de `/mnt/programas/DeepSeekHarness/Trabalho e Finanças/`
