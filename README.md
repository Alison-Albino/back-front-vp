# Separação do Projeto em Frontend e Backend

Para separar o projeto em duas partes (frontend e backend), siga estas instruções:

## Backend (Strapi)

Mova os seguintes arquivos e pastas para a pasta `backend`:

- `config/` (pasta)
- `database/` (pasta)
- `strapi-config.js`
- `setup-strapi.sh`
- `package.json`
- `package-lock.json`
- `.gitignore`

## Frontend

Mova os seguintes arquivos para a pasta `frontend`:

- `index.html`
- `produtos.html`
- `produto-detalhes.html`
- `integracao-html.js`
- `favicon.png`
- `Logo.png`
- `types/` (pasta)

## Configuração do Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm run develop
```

## Configuração do Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Abra o arquivo `index.html` em um navegador ou use um servidor local.

## Deploy

### Backend (Render)
1. Crie uma conta no Render
2. Crie um novo Web Service
3. Conecte com seu repositório Git
4. Configure as variáveis de ambiente necessárias
5. Deploy!

### Frontend (Netlify)
1. Crie uma conta no Netlify
2. Conecte com seu repositório Git
3. Configure o diretório de build como `frontend`
4. Deploy! 