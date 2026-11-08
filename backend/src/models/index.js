const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/database')[env];

const User = require('./User');
const Product = require('./Product');

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

const models = { User, Product };

Object.values(models).forEach((model) => model.init(sequelize));
Object.values(models).forEach((model) => model.associate && model.associate(models));

module.exports = { sequelize, ...models };
