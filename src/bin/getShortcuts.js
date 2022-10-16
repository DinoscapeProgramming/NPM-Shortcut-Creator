#! /usr/bin/env node
const shortcuts = require('../shortcutCreator.js');

shortcuts.getShortcuts().then((result) => {
  console.log(result);
});