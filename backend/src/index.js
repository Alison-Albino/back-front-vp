module.exports = {
  async bootstrap() {
    const produtos = [
      {
        titulo: "Bticino",
        marca: "Bticino", 
        categoria: "Premium",
        descricao: "Vídeo porteiros com design italiano, tela touch e conectividade Wi-Fi para controle via smartphone.",
        caracteristicas: {
          recursos: [
            "Integração com sistemas smart home",
            "Câmera HD com visão noturna",
            "Atendimento remoto via aplicativo"
          ]
        },
        disponivel: true,
        publishedAt: new Date()
      },
      {
        titulo: "Fermax",
        marca: "Fermax",
        categoria: "Profissional", 
        descricao: "Sistemas de controle de acesso com reconhecimento facial e tecnologia anti-clonagem para máxima segurança.",
        caracteristicas: {
          recursos: [
            "Múltiplos métodos de autenticação",
            "Software de gestão de acessos",
            "Registro de eventos em tempo real"
          ]
        },
        disponivel: true,
        publishedAt: new Date()
      },
      {
        titulo: "Comelit",
        marca: "Comelit",
        categoria: "Integrado",
        descricao: "Sistemas integrados de segurança residencial com monitoramento centralizado e interface intuitiva.",
        caracteristicas: {
          recursos: [
            "Integração com alarmes e CFTV",
            "Controle por comandos de voz", 
            "Automação residencial avançada"
          ]
        },
        disponivel: true,
        publishedAt: new Date()
      }
    ];

    // Verificar se produtos já existem
    const existingCount = await strapi.entityService.count('api::produto.produto');
    
    if (existingCount === 0) {
      console.log('📦 Criando produtos iniciais...');
      
      for (const produto of produtos) {
        await strapi.entityService.create('api::produto.produto', {
          data: produto
        });
      }
      
      console.log('✅ Produtos criados com sucesso!');
    }
  }
};