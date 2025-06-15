// Script para integrar com seu index.html
// Adicione este código no final do seu index.html, antes do </body>

const API_URL = (window.VITE_API_URL || 'https://video-porteiro-backend.onrender.com');

async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/api/produtos?populate=*`);
        const data = await response.json();
        
        const produtos = data.data;
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-8');
        
        if (!container) {
            console.error('Container de produtos não encontrado');
            return;
        }
        
        // Limpar produtos existentes
        container.innerHTML = '';
        
        // Renderizar produtos da API
        produtos.forEach(produto => {
            const attrs = produto.attributes;
            const imagemUrl = attrs.imagem_principal?.data?.attributes?.url 
                ? `${API_URL}${attrs.imagem_principal.data.attributes.url}`
                : 'img/default.jpg';
            
            const caracteristicas = attrs.caracteristicas?.recursos || [];
            
            const produtoHTML = `
                <div class="product-card bg-[#12121e] rounded-lg overflow-hidden border border-gray-800 glow-box">
                    <div class="h-64 overflow-hidden">
                        <img src="${imagemUrl}" alt="${attrs.titulo}" class="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105">
                    </div>
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            <h3 class="text-xl font-bold">${attrs.titulo}</h3>
                            <div class="ml-auto px-3 py-1 bg-primary bg-opacity-20 rounded-full text-xs text-primary">${attrs.categoria}</div>
                        </div>
                        <p class="text-gray-400 mb-4">${attrs.descricao}</p>
                        <ul class="space-y-2 mb-6">
                            ${caracteristicas.map(item => `
                                <li class="flex items-center text-sm text-gray-300">
                                    <div class="w-5 h-5 mr-2 flex items-center justify-center text-primary">
                                        <i class="ri-check-line"></i>
                                    </div>
                                    ${item}
                                </li>
                            `).join('')}
                        </ul>
                        <a href="especificacoes.html?id=${produto.id}" class="inline-block w-full text-center py-2 border border-primary text-primary rounded-button hover:bg-primary hover:text-white transition-colors whitespace-nowrap">Ver informações</a>
                    </div>
                </div>
            `;
            container.innerHTML += produtoHTML;
        });
        
        console.log('✅ Produtos carregados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
    }
}

// Carregar produtos quando a página carregar
document.addEventListener('DOMContentLoaded', carregarProdutos);