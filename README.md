# NPX Shortcut Creator
A package you can use to easily create NPX shortcuts

## Documentation
```js
const shortcuts = require('npx-shortcut-creator');
```

### Configure Options (optional)
```js
shortcuts.configureOptions({
  type: "bin" || "script", // set the type of your shortcut
  command: "node {-url}", // the command ran in the terminal => only required if type is script
}).then(({ options }) => {
  console.log(options);
});
```

### Get Options
```js
shortcuts.getOptions().then(({ options }) => {
  console.log(options);
});
```

### Create shortcut
```js
shortcuts.createShortcut("myShortcut", (firstArgument, secondArgument) => {
  console.log("This are the arguments: " + firstArgument + secondArgument);
}, [
  `"My first argument"`,
  `"My second argument"`
] /* IMPORTANT: dont forget to put quotation marks for strings */).then(({ name, arguments }) => {
  console.log("Created a shortcut called " + name + "with the following arguments: " + arguments.join(", "));
});
```

### Delete shortcut
```js
shortcuts.deleteShortcut("myShortcut").then(({ name }) => {
  console.log("Deleted command called " + name);
});
```

### Get shortcuts
```js
shortcuts.getShortcuts().then(({ shortcuts }) => {
  console.log(shortcuts);
});
```

### Execute command
```js
shortcuts.executeShortcut("myShortcut", ["My first argument", "My second argument"]).then(({ err, data: { stdout, stderr } }) => {
  if (err) return console.log(err); // err => execution failed
  console.log(stdout, stderr); // (stdout => successful output) || (stderr => failed output)
});
```

### Install bin commands
```js
shortcuts.installBin().then(() => {
  console.log("Installed all bin commands");
}); // basically runs "npm install -g"
```

### Terminal
#### Install new commands
```
npm install -g
```

#### Execute command
##### Bin
```
npx <command>
```

##### Script
```
npm run <command>
```

#### Errors
##### File already exists
Try to remove all already installed commands and use the command then. After that you can add all removed commands back to the package file.