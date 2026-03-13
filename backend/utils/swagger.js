const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Author Content Management System API',
      version: '1.0.0',
      description: 'API documentation for the Author CMS (eBooks and Audiobooks)',
      contact: {
        name: 'Joe Joseph',
        email: 'joejoseph@gmail.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          name: 'x-auth-token',
          in: 'header',
          description: 'JWT token for authentication'
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);
module.exports = specs;
