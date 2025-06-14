// Script para integrar com seu index.html
// Adicione este código no final do seu index.html, antes do </body>

// URL base da API do Strapi
const STRAPI_API_BASE_URL = 'http://localhost:1337'; // Altere para a URL do seu backend no Render

// Variáveis globais para produtos
let allProdutos = [];
let filteredProdutos = [];
let currentCategory = 'all';
let currentSearch = '';

// Elementos DOM comuns
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState'); // Usado em produtos.html
const produtosGrid = document.getElementById('produtosGrid'); // Usado em produtos.html
const searchInput = document.getElementById('searchInput'); // Usado em produtos.html
const categoryFilters = document.getElementById('categoryFilters'); // Usado em produtos.html

// Elementos DOM para detalhes do produto
const productContent = document.getElementById('productContent');
const breadcrumbProduct = document.getElementById('breadcrumbProduct');
const productName = document.getElementById('productName');
const productBrand = document.getElementById('productBrand');
const productCategory = document.getElementById('productCategory');
const productDescription = document.getElementById('productDescription');
const highlightBadge = document.getElementById('highlightBadge');
const priceSection = document.getElementById('priceSection');
const productPrice = document.getElementById('productPrice');
const featuresSection = document.getElementById('featuresSection');
const featuresList = document.getElementById('featuresList');
const specificationsSection = document.getElementById('specificationsSection');
const specificationsList = document.getElementById('specificationsList');
const whatsappLink = document.getElementById('whatsappLink');
const mainImage = document.getElementById('mainImage');
const thumbnailList = document.getElementById('thumbnailList');
const prevImageBtn = document.getElementById('prevImageBtn');
const nextImageBtn = document.getElementById('nextImageBtn');

let currentImageIndex = 0;
let productImages = [];

// Helper para criar imagem placeholder
function createPlaceholderImage(nomeProduto) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2a2a3e'; // Fundo escuro
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8A2BE2'; // Cor do texto
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sem Imagem', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px Arial';
    ctx.fillText(nomeProduto, canvas.width / 2, canvas.height / 2 + 10);

    return canvas.toDataURL();
}

// Funções de controle de estado (show/hide)
function showLoading() {
    if (loadingState) loadingState.classList.remove('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (produtosGrid) produtosGrid.classList.add('hidden');
    if (productContent) productContent.classList.add('hidden');
}

function showError(message = 'Não foi possível conectar com o servidor.') {
    if (errorState) {
        const errorMessageElement = errorState.querySelector('p');
        if (errorMessageElement) errorMessageElement.textContent = message;
        errorState.classList.remove('hidden');
    }
    if (loadingState) loadingState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (produtosGrid) produtosGrid.classList.add('hidden');
    if (productContent) productContent.classList.add('hidden');
}

function showEmpty() {
    if (emptyState) emptyState.classList.remove('hidden');
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (produtosGrid) produtosGrid.classList.add('hidden');
    if (productContent) productContent.classList.add('hidden');
}

function hideAllStates() {
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}

function showProdutosGrid() {
    hideAllStates();
    if (produtosGrid) produtosGrid.classList.remove('hidden');
}

function showProductContent() {
    hideAllStates();
    if (productContent) productContent.classList.remove('hidden');
}


// --- Lógica para a página produtos.html ---
async function loadAllProdutos() {
    try {
        showLoading();
        console.log('🚀 Iniciando carregamento de todos os produtos...');

        const response = await fetch(`${STRAPI_API_BASE_URL}/api/produtos?populate=*`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        allProdutos = data.data.map(item => ({
            id: item.id,
            nome: item.attributes.nome,
            marca: item.attributes.marca,
            categoria: item.attributes.categoria,
            descricao: item.attributes.descricao,
            preco: item.attributes.preco,
            destaque: item.attributes.destaque,
            caracteristicas: item.attributes.caracteristicas || [],
            especificacoes: item.attributes.especificacoes || {},
            imagens: item.attributes.imagens.data ? item.attributes.imagens.data.map(img => ({
                url: `${STRAPI_API_BASE_URL}${img.attributes.url}`
            })) : []
        }));

        filteredProdutos = [...allProdutos];

        console.log('📊 Total de produtos carregados:', allProdutos.length);

        await loadCategorias(); // Carregar categorias dinamicamente
        applyFilters(); // Aplicar filtros iniciais (todos)
        showProdutosGrid();

    } catch (error) {
        console.error('❌ Erro ao carregar todos os produtos:', error);
        showError(error.message);
    }
}

async function loadCategorias() {
    try {
        // Alternativa: Se o Strapi tem um endpoint para categorias, use-o
        // const response = await fetch(`${STRAPI_API_BASE_URL}/api/categorias`);
        // const data = await response.json();
        // const categorias = data.data.map(item => item.attributes.nome);

        // Por enquanto, extrai categorias dos produtos carregados
        const categorias = [...new Set(allProdutos.map(p => p.categoria))].sort();

        if (categoryFilters) {
            categoryFilters.innerHTML = '';
            const allButton = document.createElement('button');
            allButton.className = 'filter-button px-4 py-2 rounded-lg active';
            allButton.setAttribute('data-category', 'all');
            allButton.textContent = 'Todos';
            allButton.addEventListener('click', () => filterByCategory('all'));
            categoryFilters.appendChild(allButton);

            categorias.forEach(categoria => {
                const button = document.createElement('button');
                button.className = 'filter-button px-4 py-2 rounded-lg';
                button.setAttribute('data-category', categoria);
                button.textContent = categoria;
                button.addEventListener('click', () => filterByCategory(categoria));
                categoryFilters.appendChild(button);
            });
        }

    } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
    }
}

function renderProdutos() {
    if (!produtosGrid) return; // Garante que estamos na página correta

    console.log('🎨 Renderizando produtos:', filteredProdutos.length);

    if (filteredProdutos.length === 0) {
        showEmpty();
        return;
    }

    produtosGrid.innerHTML = '';
    produtosGrid.classList.remove('hidden');

    filteredProdutos.forEach(produto => {
        const produtoCard = createProdutoCard(produto);
        produtosGrid.appendChild(produtoCard);
    });

    hideAllStates(); // Esconde estados de carregamento/erro/vazio se produtos forem renderizados
}

function createProdutoCard(produto) {
    const card = document.createElement('div');
    card.className = 'product-card bg-[#12121e] rounded-lg overflow-hidden border border-gray-800 glow-box';

    let imagemSrc;
    if (produto.imagens && produto.imagens.length > 0) {
        imagemSrc = produto.imagens[0].url;
    } else {
        imagemSrc = createPlaceholderImage(produto.nome);
    }

    const badgeDestaque = produto.destaque
        ? '<div class="ml-auto px-3 py-1 bg-primary bg-opacity-20 rounded-full text-xs text-primary badge-glow">Destaque</div>'
        : '';

    const caracteristicas = Array.isArray(produto.caracteristicas) ? produto.caracteristicas.slice(0, 3) : [];

    card.innerHTML = `
        <div class="h-64 overflow-hidden">
            <img src="${imagemSrc}" alt="${produto.nome}" class="w-full h-full object-contain transition-transform duration-500 hover:scale-105" onerror="this.src='${createPlaceholderImage(produto.nome)}'">
        </div>
        <div class="p-6">
            <div class="flex items-start mb-4">
                <h3 class="text-xl font-bold flex-1 mr-2">${produto.nome}</h3>
                ${badgeDestaque}
            </div>
            <div class="mb-3">
                <span class="text-sm text-primary font-medium">${produto.marca}</span>
                <span class="text-sm text-gray-400 ml-2">• ${produto.categoria}</span>
            </div>
            <p class="text-gray-400 mb-4 line-clamp-3">${produto.descricao}</p>
            ${caracteristicas.length > 0 ? `
                <ul class="space-y-2 mb-6">
                    ${caracteristicas.map(carac => `
                        <li class="flex items-start text-sm text-gray-300">
                            <i class="ri-check-line text-primary mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>${carac}</span>
                        </li>
                    `).join('')}
                </ul>
            ` : ''}
            <div class="flex gap-2">
                <a href="produto-detalhes.html?id=${produto.id}" class="flex-1 text-center py-2 bg-primary text-white rounded-button hover:bg-opacity-90 transition-colors">
                    Ver detalhes
                </a>
                <a href="https://wa.me/351938579125?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre o produto: ${produto.nome}`)}" 
                   target="_blank" 
                   class="px-4 py-2 border border-primary text-primary rounded-button hover:bg-primary hover:text-white transition-colors">
                    <i class="ri-whatsapp-line"></i>
                </a>
            </div>
        </div>
    `;

    return card;
}

function filterByCategory(category) {
    currentCategory = category;
    if (categoryFilters) {
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        const activeButton = categoryFilters.querySelector(`[data-category="${category}"]`);
        if (activeButton) activeButton.classList.add('active');
    }
    applyFilters();
}

function filterBySearch(searchTerm) {
    currentSearch = searchTerm.toLowerCase();
    applyFilters();
}

function applyFilters() {
    filteredProdutos = allProdutos.filter(produto => {
        const categoryMatch = currentCategory === 'all' || produto.categoria === currentCategory;
        const searchMatch = currentSearch === '' ||
            produto.nome.toLowerCase().includes(currentSearch) ||
            produto.marca.toLowerCase().includes(currentSearch) ||
            produto.categoria.toLowerCase().includes(currentSearch) ||
            produto.descricao.toLowerCase().includes(currentSearch);
        return categoryMatch && searchMatch;
    });
    renderProdutos();
}

// --- Lógica para a página produto-detalhes.html ---
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function loadProductDetails() {
    const productId = getProductIdFromUrl();

    if (!productId) {
        console.error('❌ ID do produto não encontrado na URL');
        showError('ID do produto não encontrado.');
        return;
    }

    try {
        showLoading();
        console.log('🚀 Carregando produto ID:', productId);

        const response = await fetch(`${STRAPI_API_BASE_URL}/api/produtos/${productId}?populate=*`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const produto = {
            id: data.data.id,
            nome: data.data.attributes.nome,
            marca: data.data.attributes.marca,
            categoria: data.data.attributes.categoria,
            descricao: data.data.attributes.descricao,
            preco: data.data.attributes.preco,
            destaque: data.data.attributes.destaque,
            caracteristicas: data.data.attributes.caracteristicas || [],
            especificacoes: data.data.attributes.especificacoes || {},
            imagens: data.data.attributes.imagens.data ? data.data.attributes.imagens.data.map(img => ({
                url: `${STRAPI_API_BASE_URL}${img.attributes.url}`
            })) : []
        };

        console.log('✅ Produto carregado:', produto);

        renderProductDetails(produto);
        showProductContent();

    } catch (error) {
        console.error('❌ Erro ao carregar produto:', error);
        showError(error.message || 'Erro ao carregar os detalhes do produto.');
    }
}

function renderProductDetails(produto) {
    if (!productContent) return; // Garante que estamos na página correta

    if (breadcrumbProduct) breadcrumbProduct.textContent = produto.nome;
    if (productName) productName.textContent = produto.nome;
    if (productBrand) productBrand.textContent = produto.marca;
    if (productCategory) productCategory.textContent = produto.categoria;
    if (productDescription) productDescription.innerHTML = produto.descricao; // Usar innerHTML para rich text

    if (highlightBadge) {
        if (produto.destaque) {
            highlightBadge.classList.remove('hidden');
        } else {
            highlightBadge.classList.add('hidden');
        }
    }

    if (priceSection && productPrice) {
        if (produto.preco && produto.preco > 0) {
            productPrice.textContent = `R$ ${produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            priceSection.classList.remove('hidden');
        } else {
            priceSection.classList.add('hidden');
        }
    }

    // Galeria de Imagens
    setupImageGallery(produto);

    // Características
    if (featuresSection && featuresList) {
        if (produto.caracteristicas && produto.caracteristicas.length > 0) {
            featuresList.innerHTML = produto.caracteristicas.map(feature => `
                <li class="flex items-center">
                    <i class="ri-check-line text-primary mr-3"></i>
                    <span class="text-gray-300">${feature}</span>
                </li>
            `).join('');
            featuresSection.classList.remove('hidden');
        } else {
            featuresSection.classList.add('hidden');
        }
    }

    // Especificações
    if (specificationsSection && specificationsList) {
        if (produto.especificacoes && Object.keys(produto.especificacoes).length > 0) {
            specificationsList.innerHTML = Object.entries(produto.especificacoes).map(([key, value]) => `
                <div class="bg-[#12121e] p-4 rounded-lg border border-gray-800">
                    <div class="text-sm text-gray-400 mb-1">${key}</div>
                    <div class="text-white font-medium">${value}</div>
                </div>
            `).join('');
            specificationsSection.classList.remove('hidden');
        } else {
            specificationsSection.classList.add('hidden');
        }
    }

    // Link do WhatsApp
    if (whatsappLink) {
        const message = `Olá! Gostaria de saber mais sobre o produto: ${produto.nome}`;
        whatsappLink.href = `https://wa.me/351938579125?text=${encodeURIComponent(message)}`;
    }
}

function setupImageGallery(produto) {
    productImages = produto.imagens || [];

    if (!mainImage || !thumbnailList || !prevImageBtn || !nextImageBtn) return; // Garante que os elementos existem

    // Se não há imagens, criar placeholder
    if (productImages.length === 0) {
        const placeholderUrl = createPlaceholderImage(produto.nome);
        productImages = [{
            url: placeholderUrl,
            alt: produto.nome
        }];
    }

    renderCarousel(0); // Renderiza a primeira imagem e thumbnails

    // Habilitar/desabilitar botões de navegação
    if (productImages.length <= 1) {
        prevImageBtn.style.display = 'none';
        nextImageBtn.style.display = 'none';
        thumbnailList.style.display = 'none';
        // Ajustar layout se não houver thumbnails
        const imageGalleryContainer = document.querySelector('.image-gallery');
        if(imageGalleryContainer) imageGalleryContainer.style.gridTemplateColumns = '1fr';
    } else {
        prevImageBtn.style.display = 'flex';
        nextImageBtn.style.display = 'flex';
        thumbnailList.style.display = 'flex';
        prevImageBtn.onclick = showPrevImage;
        nextImageBtn.onclick = showNextImage;
    }
}

function renderCarousel(index) {
    if (!mainImage || !thumbnailList) return;

    currentImageIndex = (index + productImages.length) % productImages.length;
    const currentImage = productImages[currentImageIndex];

    mainImage.src = currentImage.url;
    mainImage.alt = currentImage.alt || (productName ? productName.textContent : '');

    thumbnailList.innerHTML = '';
    productImages.forEach((img, idx) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${idx === currentImageIndex ? 'active' : ''}`;
        thumbnail.onclick = () => renderCarousel(idx);
        thumbnail.innerHTML = `<img src="${img.url}" alt="${img.alt || (productName ? productName.textContent : '')}" class="w-full h-full object-contain">`;
        thumbnailList.appendChild(thumbnail);
    });
}

function showNextImage() {
    renderCarousel(currentImageIndex + 1);
}

function showPrevImage() {
    renderCarousel(currentImageIndex - 1);
}


// Inicialização baseada na URL para carregar produtos ou detalhes
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado, iniciando aplicação...');

    // Header scroll effect (comum a ambas as páginas)
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(20, 20, 30, 0.95)';
                header.style.backdropFilter = 'blur(8px)';
            } else {
                header.style.backgroundColor = 'transparent';
                header.style.backdropFilter = 'none';
            }
        });
    }

    // Lógica condicional para carregar produtos ou detalhes de produto
    if (document.body.classList.contains('page-produtos')) { // Adicione esta classe ao body de produtos.html
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterBySearch(this.value);
            });
        }
        // O listener para o botão 'Todos' é adicionado em loadCategorias()
        loadAllProdutos();
    } else if (document.body.classList.contains('page-produto-detalhes')) { // Adicione esta classe ao body de produto-detalhes.html
        loadProductDetails();
    }
});