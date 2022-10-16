module.exports = {
  ...require('./src/shortcutCreator.js'),
  ...{
    defaultOptions: require('./src/defaultOptions.json'),
    synchronous: require('./src/shortcutCreatorSync.js')
  }
}