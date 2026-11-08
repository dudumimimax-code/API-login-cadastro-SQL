require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('ERRO: defina JWT_SECRET no arquivo .env');
  process.exit(1);
}

const app = require('./app');
const { sequelize } = require('./models');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Não foi possível conectar ao banco de dados:', err.message);
    process.exit(1);
  }
}

start();
