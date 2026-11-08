require('dotenv').config();

// Configuração única usada tanto pela aplicação quanto pelo sequelize-cli (migrations).
const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  storage: process.env.DB_STORAGE, // usado apenas se DB_DIALECT=sqlite (testes)
  logging: false,
  define: {
    underscored: true, // createdAt -> created_at, userId -> user_id
    timestamps: true,
    createdAt: 'created_at', // nomes iguais aos do enunciado também no JSON
    updatedAt: 'updated_at',
  },
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
