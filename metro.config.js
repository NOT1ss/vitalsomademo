const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Cria um caminho para o arquivo vazio
const emptyModulePath = path.resolve(__dirname, 'empty-module.js');

// Força o Metro a ignorar os módulos do Node que o `ws` tenta importar
config.resolver.extraNodeModules = {
  ws: emptyModulePath,
  stream: emptyModulePath,
  buffer: emptyModulePath,
  process: emptyModulePath,
  http: emptyModulePath,
  https: emptyModulePath,
  net: emptyModulePath,
  tls: emptyModulePath,
  crypto: emptyModulePath,
  zlib: emptyModulePath,
  util: emptyModulePath,
  url: emptyModulePath,
  events: emptyModulePath,
};

module.exports = config;
