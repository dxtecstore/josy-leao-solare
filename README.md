# Josy Leao Solare

Vitrine premium e plataforma de gestao para `Josy Leao Solare | Centro de Bronzeamento e Estetica`.

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
- Agenda inteligente com bloqueio de horarios e status de atendimento
- CRM de clientes com historico, ultimo procedimento e observacoes
- Galeria antes e depois com upload por categoria
- Catalogo de servicos com preco, tempo medio e imagem
- Programa fidelidade com controle de sessoes e bonus
- Campanhas WhatsApp com lista exportavel e mensagens prontas
- Depoimentos e provas reais
- Configuracoes do site com logo, hero, Instagram, WhatsApp e endereco

## Personalizacao futura

- Substituir placeholders por fotos reais no admin.
- Atualizar logo e hero pelo Studio OS.
- Atualizar Instagram e imagens da fachada/localizacao.

## Escopo desta versao

Esta entrega contem a landing page premium e a primeira versao funcional do Solare Studio OS.
