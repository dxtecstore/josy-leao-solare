# Josy Leao Solare

Landing page premium para `Josy Leao Solare | Centro de Bronzeamento e Estetica`.

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

## Personalizacao futura

- Trocar o numero em `src/App.tsx` na constante `whatsappNumber`.
- Substituir placeholders da galeria por fotos reais.
- Inserir logo oficial no topo e favicon quando enviados pela cliente.
- Atualizar Instagram e imagens da fachada/localizacao.

## Escopo desta versao

Esta primeira entrega contem somente a landing page comercial premium. Nao inclui painel admin.
