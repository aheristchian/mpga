const kebabCase = (str) => str.toLowerCase().replace(/\s+/g, '-');

const camelCase = (str) =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

export { kebabCase, camelCase };
