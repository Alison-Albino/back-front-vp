export default ({ env }) => ({
  // ... outras configurações de plugins (se houver, adicione aqui)
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  // Adicione esta seção para desabilitar explicitamente o provedor de upload local
  upload: {
    enabled: false,
  },
  // ...
}); 