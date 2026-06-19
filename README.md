# Josy Leao Solare

Vitrine premium e plataforma de gestao para `Josy Leao Solare`.

A versao comercial atual esta preparada para venda consultiva de catalogo adulto 18+, com atendimento discreto via WhatsApp, fotos de produtos, cards de alta conversao e area administrativa para editar catalogo, galeria, servicos, depoimentos e configuracoes.

Nome interno do sistema: `Solare Studio OS`.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React

## Rodar localmente

```bash
npm install
npm run dev
```

Rotas principais:

- `/` - landing page comercial
- `/admin/login` - login do Studio OS
- `/admin/dashboard` - plataforma de gestao

## Build

```bash
npm run build
```

O build gera a pasta `dist`, pronta para deploy na Vercel com:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Branch principal: `main`

## Variaveis de ambiente

Copie `.env.example` para `.env` quando o novo projeto Supabase estiver provisionado.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Supabase

A migration inicial esta em:

```bash
supabase/migrations/001_solarestudio_schema.sql
```

Ela cria:

- `products`
- `services`
- `gallery`
- `appointments`
- `testimonials`
- `settings`
- `clients`
- `time_blocks`
- bucket publico `josy-media`

Depois de criar o projeto Supabase `josy-leao-solare`, aplique a migration e crie um usuario no Supabase Auth para acessar o admin.

## Solare Studio OS

Modulos incluidos:

- Dashboard com agendamentos do dia, clientes da semana, receita estimada e servico mais procurado
- Produtos Sexy Shop com cadastro, preco, categoria, foto, status ativo/inativo e upload
- Agenda inteligente com bloqueio de horarios e status de atendimento
- CRM de clientes com historico, ultimo procedimento e observacoes
- Galeria antes e depois com upload por categoria
- Catalogo de servicos com preco, tempo medio e imagem
- Programa fidelidade com controle de sessoes e bonus
- Campanhas WhatsApp com lista exportavel e mensagens prontas
- Depoimentos e provas reais
- Configuracoes do site com logo, hero, Instagram, WhatsApp e endereco

## Catalogo de venda

As imagens iniciais do catalogo estao em:

```bash
public/products/
```

A logo oficial convertida do PDF esta em:

```bash
public/brand/josy-logo-from-pdf.webp
```

Para trocar nome, preco, descricao ou foto sem Supabase configurado, use o admin demo em `/admin/login`. Para ambiente com Supabase, aplique a migration e use o modulo `Produtos Sexy Shop`.

## Personalizacao futura

- Substituir ou reorganizar fotos reais no admin.
- Atualizar logo e hero pelo Studio OS.
- Atualizar Instagram, WhatsApp, endereco e imagens da vitrine.

## Escopo desta versao

Esta entrega contem a landing page premium e a primeira versao funcional do Solare Studio OS.
