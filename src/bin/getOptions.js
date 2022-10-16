#! /usr/bin/env node
const shortcuts = require('../shortcutCreator.js');

shortcuts.getOptions().then((result) => {
  console.log(result);
});