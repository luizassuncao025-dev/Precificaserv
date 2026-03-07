# OdontoPrice Pro

Versão profissional do app de precificação odontológica, construída em Next.js + TypeScript + Supabase.

## O que esta versão entrega

1. Login com e-mail e senha
2. Cadastro de vários procedimentos
3. Cálculo com base na planilha original
4. Custos fixos e hora clínica persistidos por usuário
5. Geração de PDF
6. Painel com histórico de preços
7. Visual premium pensado para vender como SaaS
8. Estrutura em nuvem para acesso de qualquer computador

## Stack

1. Next.js App Router
2. TypeScript
3. Supabase Auth + Postgres
4. jsPDF
5. lucide-react

## Como rodar localmente

1. Extraia a pasta
2. Abra o terminal nela
3. Rode:

```bash
npm install
npm run dev
```

4. Acesse:

```bash
http://localhost:3000
```

## Variáveis de ambiente

Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

## Como criar o banco no Supabase

1. Crie um projeto no Supabase
2. Vá em SQL Editor
3. Execute o arquivo `supabase/schema.sql`
4. Em Authentication, habilite e-mail/senha
5. Copie URL e ANON KEY para `.env.local`

## Como colocar em nuvem para acessar em outro computador

O caminho mais simples é:

1. Subir esse projeto no GitHub
2. Conectar o repositório na Vercel
3. Adicionar as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Fazer deploy

Depois disso, o app ficará online com uma URL pública e você poderá acessar de qualquer computador com login.

## Fluxo ideal de deploy

1. GitHub
2. Vercel para frontend
3. Supabase para autenticação e banco

## Observação importante

Sem configurar o Supabase, o layout abre, mas login, salvamento em nuvem e histórico não funcionarão. Esses recursos dependem do banco e autenticação.
