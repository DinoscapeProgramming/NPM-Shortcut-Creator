const fs = require('fs');
const { resolve } = require('path');
const path = require('path');
const defaultOptions = require('./defaultOptions.json');

function configureOptions({ type, command, commandProperties, spacing, typeExecution, installBinCommand }) {
  module.exports.options = {
    ...(type) ? {
      type
    } : {},
    ...(command) ? {
      command
    } : {},
    ...(commandProperties) ? {
      commandProperties
    } : {},
    ...(spacing) ? {
      spacing
    } : {},
    ...(typeExecution) ? {
      typeExecution
    } : {},
    ...(installBinCommand) ? {
      installBinCommand
    } : {}
  }
  return { action: 'configureOptionsSync', options: module.exports.options || {} };
}

function getOptions() {
  return { action: 'getOptionsSync', options: module.exports.options || {} };
}

function createShortcut(name, func, args, options) {
  if (!name) return { action: 'createShortcutSync', err: 'No name was given' };
  if (!func) return { action: 'createShortcutSync', err: "No function was given" };
  if (!fs.readdirSync(__dirname).includes('shortcuts')) {
    fs.mkdirSync(path.join(__dirname, 'shortcuts'));
  }
  try {
    fs.writeFileSync(path.join(__dirname, 'shortcuts', name + '.js'), '#! /usr/bin/env node\n(' + func.toString() + ')(' + ((args || []).join(', ') || '') + ');', 'utf8');
    fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify({
      ...require(path.join(process.cwd(), 'package.json')),
      ...{
        ...((options?.type || module.exports?.options?.type || defaultOptions?.type) === 'bin') ? {
          bin: {
            ...require(path.join(process.cwd(), 'package.json')).bin || {},
            ...{
              [name]: path.join(__dirname, 'shortcuts', name + '.js').replaceAll('\\', '/').split('/').filter((_, index) => index > (process.cwd().replaceAll('\\', '/').split('/').length - 1)).join('/')
            }
          }
        } : {},
        ...((options?.type || module.exports?.options?.type || defaultOptions?.type) === 'script') ? {
          scripts: {
            ...require(path.join(process.cwd(), 'package.json')).scripts || {},
            ...{
              [name]: Object.entries(options?.commandProperties || module.exports?.options?.commandProperties || defaultOptions?.commandProperties).reduce((data, property) => data.replace(`{-${property[0]}}`, eval(property[1])), (options?.command || module.exports?.options?.command || defaultOptions?.command))
            }
          }
        } : {}
      }
    }, null, options?.spacing || module.exports?.options?.spacing || defaultOptions?.spacing), 'utf8');
  } catch (err) {
    return { action: 'createShortcutSync', err: err.message };
  }
  return { action: 'createShortcutSync', name, function: func || (() => {}), arguments: arguments || [], options: options || module.exports?.options || defaultOptions };
}

function deleteShortcut(name, options) {
  if (!name) return { action: 'deleteShortcutSync', err: 'No name was given' };
  if (!fs.readdirSync(__dirname).includes('shortcuts')) return { action: 'deleteShortcutSync', name };
  try {
    fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify({
      ...require(path.join(process.cwd(), 'package.json')),
      ...{
        ...((options?.type || module.exports?.options?.type || defaultOptions?.type) === 'bin') ? {
          bin: Object.entries(require(path.join(process.cwd(), 'package.json')).bin || {}).filter((shortcut) => shortcut[0] !== name).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {})
        } : {},
        ...((options?.type || module.exports?.options?.type || defaultOptions?.type) === 'scripts') ? {
          scripts: Object.entries(require(path.join(process.cwd(), 'package.json')).scripts || {}).filter((shortcut) => shortcut[0] !== name).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {})
        } : {}
      }
    }, null, options?.spacing || module.exports?.options?.spacing || defaultOptions?.spacing), 'utf8');
  } catch (err) {
    return { action: 'deleteShortcutSync', err: err.message };
  }
  return { action: 'deleteShortcutSync', name, options: options || module.exports?.options || defaultOptions };
}

function getShortcuts() {
  if (!fs.readdirSync(__dirname).includes('shortcuts')) return { action: 'getShortcutsSync', shortcuts: {} };
  return {
    action: 'getShortcutsSync',
    shortcuts: {
      bin: Object.entries(require(path.join(process.cwd(), 'package.json')).bin || {}).map((shortcut) => [shortcut[0], { path: shortcut[1], data: fs.readFileSync(path.join(__dirname, 'shortcuts', shortcut[1].split('/').pop()), "utf8") }]).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {}),
      scripts: Object.entries(require(path.join(process.cwd(), 'package.json')).scripts || {}).map((shortcut) => [shortcut[0], { command: shortcut[1] }]).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {})
    }
  };
}

function executeShortcut(name, arguments, options) {
  if (!name) return { action: 'executeShortcutSync', err: 'No name was given' };
  childProcress.exec((options?.typeExecution || module.exports?.options?.typeExecution || defaultOptions?.typeExecution)[options?.type || module.exports?.options?.type || defaultOptions?.type] + " " + name + (((arguments || []).length === 0) ? "" : " ") + (arguments || []).join(" "), (err, stdout, stderr) => {
    if (err) return resolve({ action: 'executeShortcutSync', err: err.message });
    return { action: 'executeShortcutSync', name, arguments: arguments || [], options: options || module.exports?.options || defaultOptions, command: (options?.typeExecution || module.exports?.options?.typeExecution || defaultOptions?.typeExecution)[options?.type || module.exports?.options?.type || defaultOptions?.type] + " " + name + (((arguments || []).length === 0) ? "" : " ") + (arguments || []).join(" "), data: { stdout, stderr } };
  });
}

function installBin(options) {
  childProcress.exec(options?.installBinCommand || module.exports?.options?.installBinCommand || defaultOptions.installBinCommand).then((err) => {
    if (err) return { action: 'installBinSync', err: err.message };
    return { action: 'installBinSync', command: options?.installBinCommand || module.exports?.options?.installBinCommand || defaultOptions.installBinCommand, shortcuts: Object.entries(require(path.join(process.cwd(), 'package.json')).bin || {}).map((shortcut) => [shortcut[0], { path: shortcut[1], data: fs.readFileSync(path.join(__dirname, 'shortcuts', shortcut[1].split('/').pop()), "utf8") }]).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {}) };
  });
}

module.exports = {
  configureOptions,
  getOptions,
  createShortcut,
  deleteShortcut,
  getShortcuts,
  executeShortcut,
  installBin
}