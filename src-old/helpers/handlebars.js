const Handlebars = require('handlebars/runtime');

Handlebars.registerHelper('kebabCase', function (str) {
  return str.toLowerCase().replace(/\s+/g, '-');
});

Handlebars.registerHelper('camelCase', function (str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
});

Handlebars.registerHelper('upperCase', function (str) {
  return str.toUpperCase();
});

Handlebars.registerHelper('lowerCase', function (str) {
  return str.toLowerCase();
});

module.exports = Handlebars;
