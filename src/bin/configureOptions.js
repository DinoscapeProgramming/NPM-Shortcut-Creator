#! /usr/bin/env node
const shortcuts = require('../shortcutCreator.js');

shortcuts.configureOptions(JSON.parse(process.argv[3])).then((result) => {
  console.log(result);
});