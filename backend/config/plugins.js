module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
        upload_preset: 'strapi_upload',
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        resource_type: 'auto',
      },
    },
  },
}); 