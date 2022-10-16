const fs = require('fs');
const path = require('path');
const childProcress = require('child_process');
const defaultOptions = require('./defaultOptions.json');

function configureOptions({ type, command, commandProperties, spacing, typeExecution, installBinCommand }) {
  return new Promise((resolve, reject) => {
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
    return resolve({ action: 'configureOptions', options: module.exports.options || {} });
  });
}

function getOptions() {
  return new Promise((resolve, reject) => {
    return resolve({ action: 'getOptions', options: module.exports.options || {} });
  });
}

function createShortcut(name, func, args, options) {
  return new Promise((resolve, reject) => {
    if (!name) return resolve({ action: 'createShortcut', err: 'No name was given' });
    if (!func) return resolve({ action: 'createShortcut', err: "No function was given" });
    if (!fs.readdirSync(__dirname).includes('shortcuts')) {
      fs.mkdirSync(path.join(__dirname, 'shortcuts'));
    }
    fs.writeFile(path.join(__dirname, 'shortcuts', name + '.js'), '#! /usr/bin/env node\n(' + func.toString() + ')(' + ((args || []).join(', ') || '') + ');', (err) => {
      if (err) return resolve({ action: 'createShortcut', err: err.message });
      fs.writeFile(path.join(process.cwd(), 'package.json'), JSON.stringify({
        ...require(path.join(process.cwd(), 'package.json')),
        ...{
          ...((options?.type || module.exports?.options?.type || defaultOptions?.type) === 'bin') ? {
            bin: {
              ...require(path.join(process.cwd(), 'package.json')).bin || {},
              ...{
                [name]: path.join(__dirname, 'shortcuts', name + '.js').replaceAll(`\\`, '/').split('/').filter((_, index) => index > (process.cwd().replaceAll('\\', '/').split('/').length - 1)).join('/')
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
      }, null, options?.spacing || module.exports?.options?.spacing || defaultOptions?.spacing), (err) => {
        if (err) return resolve({ action: 'createShortcut', err: err.message });
        return resolve({ action: 'createShortcut', name, function: func || (() => {}), arguments: arguments || [], options: options || module.exports?.options || defaultOptions });
      });
    });
  });
}

function deleteShortcut(name, options) {
  return new Promise((resolve, reject) => {
    if (!name) return resolve({ action: 'deleteShortcut', err: 'No name was given' });
    if (!fs.readdirSync(__dirname).includes('shortcuts')) return resolve({ action: 'deleteShortcut', name });
    fs.writeFile(path.join(process.cwd(), 'package.json'), JSON.stringify({
      ...require(path.join(process.cwd(), 'package.json')),
      ...{
        ...((options?.type || module.exports?.options?.type || defaultOptions?.type) === 'bin') ? {
          bin: Object.entries(require(path.join(process.cwd(), 'package.json')).bin || {}).filter((shortcut) => shortcut[0] !== name).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {})
        } : {},
        ...((options?.type || module.exports?.options?.type || defaultOptions?.type) === 'scripts') ? {
          scripts: Object.entries(require(path.join(process.cwd(), 'package.json')).scripts || {}).filter((shortcut) => shortcut[0] !== name).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {})
        } : {}
      }
    }), (err) => {
      if (err) return resolve({ action: 'deleteShortcut', err: err.message });
      return resolve({ action: 'deleteShortcut', name, options: options || module.exports?.options || defaultOptions });
    });
  });
}

function getShortcuts() {
  return new Promise((resolve, reject) => {
    if (!fs.readdirSync(__dirname).includes('shortcuts')) return resolve({ action: 'getShortcuts', shortcuts: {} });
    return resolve({
      action: 'getShortcuts',
      shortcuts: {
        bin: Object.entries(require(path.join(process.cwd(), 'package.json')).bin || {}).map((shortcut) => [shortcut[0], { path: shortcut[1], data: fs.readFileSync(path.join(__dirname, 'shortcuts', shortcut[1].split('/').pop()), "utf8") }]).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {}),
        scripts: Object.entries(require(path.join(process.cwd(), 'package.json')).scripts || {}).map((shortcut) => [shortcut[0], { command: shortcut[1] }]).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {})
      }
    });
  });
}

function executeShortcut(name, arguments, options) {
  return new Promise((resolve, reject) => {
    if (!name) return resolve({ action: 'executeShortcut', err: 'No name was given' });
    childProcress.exec((options?.typeExecution || module.exports?.options?.typeExecution || defaultOptions?.typeExecution)[options?.type || module.exports?.options?.type || defaultOptions?.type] + " " + name + (((arguments || []).length === 0) ? "" : " ") + (arguments || []).join(" "), (err, stdout, stderr) => {
      if (err) return resolve({ action: 'executeShortcut', err: err.message });
      return resolve({ action: 'executeShortcut', name, arguments: arguments || [], options: options || module.exports?.options || defaultOptions, command: (options?.typeExecution || module.exports?.options?.typeExecution || defaultOptions?.typeExecution)[options?.type || module.exports?.options?.type || defaultOptions?.type] + " " + name + (((arguments || []).length === 0) ? "" : " ") + (arguments || []).join(" "), data: { stdout, stderr } });
    });
  });
}

function installBin(options) {
  return new Promise((resolve, reject) => {
    childProcress.exec(options?.installBinCommand || module.exports?.options?.installBinCommand || defaultOptions.installBinCommand).then((err) => {
      if (err) return resolve({ action: 'installBin', err: err.message });
      return resolve({ action: 'installBin', command: options?.installBinCommand || module.exports?.options?.installBinCommand || defaultOptions.installBinCommand, shortcuts: Object.entries(require(path.join(process.cwd(), 'package.json')).bin || {}).map((shortcut) => [shortcut[0], { path: shortcut[1], data: fs.readFileSync(path.join(__dirname, 'shortcuts', shortcut[1].split('/').pop()), "utf8") }]).reduce((args, shortcut) => ({ ...args, ...{ [shortcut[0]]: shortcut[1] } }), {}) });
    });
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