#! /usr/bin/env node
const shortcuts = require('../shortcutCreator.js');

shortcuts.installBin().then((result) => {
  console.log(result);
});