#!/bin/bash

echo "🚀 Configurando Strapi para o projeto..."

# 1. Instalar Strapi
echo "📦 Instalando Strapi..."
npx create-strapi-app@latest meu-projeto-strapi --quickstart

cd meu-projeto-strapi

# 2. Instalar dependências adicionais
echo "📦 Instalando dependências..."
npm install @strapi/plugin-upload

# 3. Iniciar Strapi
echo "🎯 Iniciando Strapi..."
echo "Acesse: http://localhost:1337/admin"
echo "Crie sua conta de admin e configure a collection 'produtos'"

npm run develop
