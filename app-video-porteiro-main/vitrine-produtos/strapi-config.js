// Configuração do Strapi para Vitrine de Produtos - VERSÃO CORRIGIDA
const StrapiConfig = {
    // URL base do Strapi
    BASE_URL: 'http://localhost:1337',

    // Modo fallback (usar dados estáticos se Strapi não estiver disponível)
    FALLBACK_MODE: true, // ← Mudado para true temporariamente para debug

    // Endpoints da API
    ENDPOINTS: {
        produtos: '/api/produtos',
        upload: '/api/upload'
    },

    // Configurações de requisição
    REQUEST_CONFIG: {
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json'
        }
    },

    // Mapeamento de campos (Strapi → Frontend)
    FIELD_MAPPING: {
        id: 'id',
        nome: 'nome',
        marca: 'marca', 
        categoria: 'categoria',
        descricao: 'descricao',
        caracteristicas: 'caracteristicas',
        especificacoes: 'especificacoes',
        preco: 'preco',
        destaque: 'destaque',
        ativo: 'ativo',
        imagens: 'imagens'
    },

    // Função para verificar se Strapi está disponível
    async checkStrapiHealth() {
        try {
            const response = await fetch(`${this.BASE_URL}/api/produtos`, {
                method: 'GET',
                headers: this.REQUEST_CONFIG.headers,
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.warn('⚠️ Strapi não está disponível:', error.message);
            return false;
        }
    },

    // Função para buscar produtos
    async fetchProdutos(filtros = {}) {
        try {
            console.log('🚀 Iniciando busca de produtos...');

            // Verificar se Strapi está disponível
            const strapiAvailable = await this.checkStrapiHealth();
            if (!strapiAvailable) {
                console.warn('⚠️ Strapi indisponível, usando dados de fallback');
                return this.getFallbackData();
            }

            let url = `${this.BASE_URL}${this.ENDPOINTS.produtos}?populate=*`;

            // Adicionar filtros se existirem
            if (filtros.categoria) {
                url += `&filters[categoria][$eq]=${encodeURIComponent(filtros.categoria)}`;
            }
            if (filtros.busca) {
                url += `&filters[nome][$containsi]=${encodeURIComponent(filtros.busca)}`;
            }
            if (filtros.destaque) {
                url += `&filters[destaque][$eq]=true`;
            }

            // Filtrar apenas produtos ativos
            url += `&filters[ativo][$eq]=true`;

            console.log('📡 URL da requisição:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.REQUEST_CONFIG.headers,
                timeout: this.REQUEST_CONFIG.timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Dados recebidos do Strapi:', data);

            const produtos = this.formatProdutos(data.data);
            console.log('✅ Produtos formatados:', produtos);

            return produtos;

        } catch (error) {
            console.error('❌ Erro ao buscar produtos:', error);
            console.warn('🔄 Usando dados de fallback...');
            return this.getFallbackData();
        }
    },

    // Função para buscar produto específico
    async fetchProduto(id) {
        try {
            console.log('🔍 Buscando produto ID:', id);

            // Verificar se Strapi está disponível
            const strapiAvailable = await this.checkStrapiHealth();
            if (!strapiAvailable) {
                console.warn('⚠️ Strapi indisponível, usando dados de fallback');
                return this.getFallbackProduto(id);
            }

            const url = `${this.BASE_URL}${this.ENDPOINTS.produtos}/${id}?populate=*`;
            console.log('📡 URL da requisição:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.REQUEST_CONFIG.headers,
                timeout: this.REQUEST_CONFIG.timeout
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`⚠️ Produto ID ${id} não encontrado no Strapi`);
                    // Tentar buscar o primeiro produto disponível como fallback
                    const produtos = await this.fetchProdutos();
                    if (produtos.length > 0) {
                        console.log('🔄 Retornando primeiro produto disponível como fallback');
                        return produtos[0];
                    }
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 Dados do produto recebidos:', data);

            const produto = this.formatProduto(data.data);
            console.log('✅ Produto formatado:', produto);

            return produto;

        } catch (error) {
            console.error('❌ Erro ao buscar produto:', error);
            console.warn('🔄 Usando dados de fallback...');
            return this.getFallbackProduto(id);
        }
    },

    // Formatar dados dos produtos vindos do Strapi
    formatProdutos(produtos) {
        if (!produtos || !Array.isArray(produtos)) {
            console.warn('⚠️ Dados de produtos inválidos:', produtos);
            return [];
        }
        return produtos.map(produto => this.formatProduto(produto));
    },

    // Formatar dados de um produto
    formatProduto(produto) {
        if (!produto) {
            console.warn('⚠️ Produto inválido:', produto);
            return null;
        }

        const attributes = produto.attributes || produto;

        console.log('DEBUG: Produto original para formatProduto:', produto);
        console.log('DEBUG: Atributos do produto:', attributes);
        console.log('DEBUG: Atributos.caracteristicas antes da formatação:', attributes.caracteristicas);
        console.log('DEBUG: Atributos.imagens antes da formatação:', attributes.imagens);

        let formattedCaracteristicas = [];
        if (attributes.caracteristicas) {
            if (Array.isArray(attributes.caracteristicas)) {
                // If it's already an array, filter to ensure string elements
                formattedCaracteristicas = attributes.caracteristicas.filter(item => typeof item === 'string');
            } else if (typeof attributes.caracteristicas === 'object' && attributes.caracteristicas.recursos && Array.isArray(attributes.caracteristicas.recursos)) {
                // If it's an object with a 'recursos' array
                formattedCaracteristicas = attributes.caracteristicas.recursos.filter(item => typeof item === 'string');
            } else if (typeof attributes.caracteristicas === 'string') {
                // Try parsing as JSON if it's a string
                try {
                    const parsed = JSON.parse(attributes.caracteristicas);
                    if (Array.isArray(parsed)) {
                        formattedCaracteristicas = parsed.filter(item => typeof item === 'string');
                    } else if (typeof parsed === 'object' && parsed.recursos && Array.isArray(parsed.recursos)) {
                        formattedCaracteristicas = parsed.recursos.filter(item => typeof item === 'string');
                    } else {
                        // If it's a string but JSON parse doesn't result in an array or object with recursos
                        formattedCaracteristicas = [attributes.caracteristicas];
                    }
                } catch (e) {
                    // If parsing fails, treat as a single string
                    formattedCaracteristicas = [attributes.caracteristicas];
                }
            } else {
                // Fallback for any other type, convert to string
                formattedCaracteristicas = [String(attributes.caracteristicas)];
            }
        }

        return {
            id: produto.id || Math.random().toString(36).substr(2, 9),
            nome: attributes.nome || 'Produto sem nome',
            marca: attributes.marca || 'Marca não informada',
            categoria: attributes.categoria || 'Categoria não informada',
            descricao: (typeof attributes.descricao === 'object' && attributes.descricao !== null && Array.isArray(attributes.descricao))
                         ? this.renderStrapiBlocksAsHtml(attributes.descricao)
                         : (attributes.descricao ? String(attributes.descricao) : 'Descrição não disponível'),
            caracteristicas: formattedCaracteristicas,
            especificacoes: this.parseJSON(attributes.especificacoes) || {},
            preco: attributes.preco || 0,
            destaque: attributes.destaque || false,
            ativo: attributes.ativo !== false,
            imagens: this.formatImagens(attributes.imagens),
            createdAt: attributes.createdAt,
            updatedAt: attributes.updatedAt
        };
    },

    // Formatar imagens do Strapi
    formatImagens(imagens) {
        let imageData = [];
        if (Array.isArray(imagens)) {
            imageData = imagens;
        } else if (imagens && Array.isArray(imagens.data)) {
            imageData = imagens.data;
        } else {
            return [];
        }

        return imageData.map(img => {
            const attrs = img.attributes || img;
            let imageUrl = attrs.url;

            // Se não houver URL, usa a imagem de placeholder
            if (!imageUrl) {
                console.warn('⚠️ Imagem sem URL. Usando placeholder para:', img);
                imageUrl = this.createPlaceholderImage(img.name || 'Imagem');
            }

            return {
                id: img.id || attrs.id,
                url: imageUrl.startsWith('http') ? imageUrl : `${this.BASE_URL}${imageUrl}`,
                alternativeText: attrs.alternativeText || '',
                caption: attrs.caption || '',
                width: attrs.width,
                height: attrs.height,
                formats: attrs.formats
            };
        }).filter(img => img !== null);
    },

    // Função para parsear JSON com segurança
    parseJSON(jsonString) {
        try {
            const result = JSON.parse(jsonString);
            return result;
        } catch (e) {
            return jsonString; // Retorna a string original se não for um JSON válido
        }
    },

    // Função para renderizar conteúdo do tipo Strapi Blocks em HTML
    renderStrapiBlocksAsHtml(blocks) {
        if (!blocks || !Array.isArray(blocks)) {
            return '';
        }

        let html = '';
        blocks.forEach(block => {
            if (block.type === 'paragraph') {
                const textContent = block.children.map(child => {
                    let text = child.text || '';
                    if (child.bold) text = `<strong>${text}</strong>`;
                    if (child.italic) text = `<em>${text}</em>`;
                    // Adicione mais formatações conforme necessário (ex: underline, strikethrough)
                    return text;
                }).join('');
                html += `<p>${textContent}</p>`;
            } else if (block.type === 'list') {
                const listTag = block.format === 'ordered' ? 'ol' : 'ul';
                const listItems = block.children.map(item => {
                    const itemContent = item.children.map(child => child.text).join('');
                    return `<li>${itemContent}</li>`;
                }).join('');
                html += `<${listTag}>${listItems}</${listTag}>`;
            } else if (block.type === 'heading') {
                const level = block.level || 1;
                const headingText = block.children.map(child => child.text).join('');
                html += `<h${level}>${headingText}</h${level}>`;
            } else if (block.type === 'image') {
                // Isso precisaria de um tratamento mais robusto para a URL da imagem do Strapi
                // Por enquanto, apenas um placeholder ou ignorar se a URL não for fácil de obter aqui
                html += '<p>[IMAGEM]</p>'; // Placeholder simples
            } else if (block.type === 'quote') {
                const quoteContent = block.children.map(child => child.text).join('');
                html += `<blockquote>${quoteContent}</blockquote>`;
            } else if (block.type === 'code') {
                const codeContent = block.children.map(child => child.text).join('');
                html += `<pre><code>${codeContent}</code></pre>`;
            }
            // Adicione outros tipos de blocos conforme necessário
        });
        return html;
    },

    // Função para criar imagem de placeholder (movida do HTML)
    createPlaceholderImage(nome) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#8A2BE2');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxWidth = 350;
        const words = nome.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        const lineHeight = 20;
        const startY = 150 - (lines.length - 1) * lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, 200, startY + index * lineHeight);
        });

        return canvas.toDataURL();
    },

    // Dados de fallback EXPANDIDOS (caso Strapi não esteja disponível)
    getFallbackData() {
        console.log('📦 Usando dados de fallback...');
        return [
            {
                id: 1,
                nome: "Bticino Classe 300X",
                marca: "Bticino",
                categoria: "Vídeo Porteiro",
                descricao: "Vídeo porteiro premium com tela touch de 7 polegadas e conectividade Wi-Fi integrada. Ideal para residências e condomínios que buscam segurança e praticidade.",
                caracteristicas: [
                    "Tela touch 7 polegadas",
                    "Wi-Fi integrado",
                    "Câmera HD 720p",
                    "Visão noturna",
                    "App móvel gratuito"
                ],
                especificacoes: {
                    "Tela": "7 TFT LCD",
                    "Resolução": "800x480",
                    "Conectividade": "Wi-Fi 2.4GHz",
                    "Alimentação": "12V DC",
                    "Temperatura": "-10°C a +55°C"
                },
                preco: 1299.99,
                destaque: true,
                ativo: true,
                imagens: []
            },
            {
                id: 2,
                nome: "Intelbras IV 7010 HF",
                marca: "Intelbras",
                categoria: "Vídeo Porteiro",
                descricao: "Vídeo porteiro com tela LCD de 7 polegadas, função hands-free e design moderno. Perfeito para casas e apartamentos.",
                caracteristicas: [
                    "Tela LCD 7 polegadas",
                    "Função hands-free",
                    "Controle de fechadura",
                    "Áudio bidirecional",
                    "Design slim"
                ],
                especificacoes: {
                    "Tela": "7 LCD",
                    "Resolução": "800x480",
                    "Alimentação": "12V DC",
                    "Consumo": "Máx. 15W",
                    "Dimensões": "200x155x20mm"
                },
                preco: 899.99,
                destaque: false,
                ativo: true,
                imagens: []
            },
            {
                id: 3,
                nome: "Fechadura Digital Yale YDM 4109",
                marca: "Yale",
                categoria: "Fechadura Digital",
                descricao: "Fechadura digital com múltiplas formas de abertura: senha, cartão, chave mecânica e aplicativo móvel.",
                caracteristicas: [
                    "Abertura por senha",
                    "Cartão de proximidade",
                    "App móvel",
                    "Chave mecânica de emergência",
                    "Histórico de acessos"
                ],
                especificacoes: {
                    "Tipo": "Fechadura Digital",
                    "Alimentação": "4 pilhas AA",
                    "Usuários": "Até 100",
                    "Material": "Liga de zinco",
                    "Garantia": "2 anos"
                },
                preco: 2199.99,
                destaque: true,
                ativo: true,
                imagens: []
            }
        ];
    },

    // Produto de fallback específico
    getFallbackProduto(id) {
        console.log('📦 Buscando produto de fallback para ID:', id);
        const produtos = this.getFallbackData();
        const produto = produtos.find(p => p.id == id);

        if (produto) {
            console.log('✅ Produto de fallback encontrado:', produto);
            return produto;
        } else {
            console.log('🔄 ID não encontrado, retornando primeiro produto');
            return produtos[0];
        }
    },

    // Buscar categorias únicas
    async getCategorias() {
        try {
            const produtos = await this.fetchProdutos();
            const categorias = [...new Set(produtos.map(p => p.categoria))];
            return categorias.filter(cat => cat && cat.trim() !== '');
        } catch (error) {
            console.error('❌ Erro ao buscar categorias:', error);
            return ['Vídeo Porteiro', 'Interfone', 'Fechadura Digital'];
        }
    },

    // Função para listar IDs disponíveis (útil para debug)
    async getAvailableIds() {
        try {
            const produtos = await this.fetchProdutos();
            const ids = produtos.map(p => p.id);
            console.log('📋 IDs disponíveis:', ids);
            return ids;
        } catch (error) {
            console.error('❌ Erro ao buscar IDs:', error);
            return [1, 2, 3];
        }
    }
};

// Disponibilizar globalmente
window.StrapiConfig = StrapiConfig;

// Debug automático ao carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 StrapiConfig carregado!');
    console.log('🔧 Para debug, use: window.StrapiConfig.getAvailableIds()');
});