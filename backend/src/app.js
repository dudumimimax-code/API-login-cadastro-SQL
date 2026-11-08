const path = require('path');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// API
app.use('/api', routes);
app.use('/api', notFound);

// Frontend estático (pasta ../frontend) servido pelo mesmo servidor
app.use(express.static(path.resolve(__dirname, '..', '..', 'frontend')));

app.use(errorHandler);

module.exports = app;
