# Josy Leão Solare

Vitrine premium e plataforma de gestão para `Josy Leão Solare`.

A versão comercial atual está preparada para venda consultiva de catálogo adulto 18+, com atendimento discreto via WhatsApp, fotos de produtos, cards de alta conversão e área administrativa para editar catálogo, galeria, serviços, depoimentos e configurações.

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
- `/admin/dashboard` - plataforma de gestão

## Build

```bash
npm run build
```

O build gera a pasta `dist`, pronta para deploy na Vercel com:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Branch principal: `main`

## Variáveis de ambiente

Copie `.env.example` para `.env` quando o novo projeto Supabase estiver provisionado.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Supabase

A migration inicial está em:

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
- bucket público `josy-media`

Depois de criar o projeto Supabase `josy-leao-solare`, aplique a migration e crie um usuário no Supabase Auth para acessar o admin.

## Solare Studio OS

Módulos incluídos:

- Dashboard com agendamentos do dia, clientes da semana, receita estimada e serviço mais procurado
- Produtos Sexy Shop com cadastro, preço, categoria, foto, status ativo/inativo e upload
- Agenda inteligente com bloqueio de horários e status de atendimento
- CRM de clientes com histórico, último procedimento e observações
- Galeria antes e depois com upload por categoria
- Catálogo de serviços com preço, tempo médio e imagem
- Programa fidelidade com controle de sessões e bônus
- Campanhas WhatsApp com lista exportavel e mensagens prontas
- Depoimentos e provas reais
- Configurações do site com logo, hero, Instagram, WhatsApp e endereço

## Catálogo de venda

As imagens iniciais do catálogo estão em:

```bash
public/products/
```

A logo oficial convertida do PDF está em:

```bash
public/brand/josy-logo-from-pdf.webp
```

Para trocar nome, preço, descrição ou foto sem Supabase configurado, use o admin demo em `/admin/login`. Para ambiente com Supabase, aplique a migration e use o módulo `Produtos Sexy Shop`.

## Personalizacao futura

- Substituir ou reorganizar fotos reais no admin.
- Atualizar logo e hero pelo Studio OS.
- Atualizar Instagram, WhatsApp, endereço e imagens da vitrine.

## Escopo desta versão

Esta entrega contém a landing page premium e a primeira versão funcional do Solare Studio OS.
