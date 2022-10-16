#! /usr/bin/env node
const shortcuts = require('../shortcutCreator.js');

shortcuts.executeShortcut.apply(this, [
  ...[
    process.argv[3],
    JSON.parse(process.argv[4])
  ],
  ...(process.argv[4]) ? [
    JSON.parse(process.argv[4])
  ] : []
]).then((result) => {
  console.log(result);
});