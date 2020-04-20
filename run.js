// This runner is meant for customisation and to give an example of
// how multiple sprite sheets can be created with a single command.
//
const mojis = require('./openmoji.json')
const asyn = require('async')
const merge = require('./index')
const generateIndex = require('./lib/htmlIndex')
const path = require('path')
const fs = require('fs')

// Filter out those with long hexcode, like skin tones.
// TODO include skin tones and other variants in some way.
const shortMojis = mojis.filter(moji => moji.hexcode.length <= 5)

// Group emojis by their group name into an object.
// Use the group names as keys.
const mojiGroups = shortMojis.reduce((acc, moji) => {
  const groupName = moji.group
  if (!acc[groupName]) {
    acc[groupName] = []
  }
  acc[groupName].push(moji)
  return acc
}, {})

// For each group, run sheet generator.
// Sheet generation is asynchronous operation, thus @caolan/async is used.
asyn.eachSeries(Object.keys(mojiGroups), (groupName, next) => {
  const mojiGroup = mojiGroups[groupName]
  merge({
    emojis: mojiGroup,
    emojiDir: path.join(__dirname, 'openmoji-72x72-color'),
    targetImagePath: path.join(__dirname, 'target', groupName + '.png'),
    targetHtmlPath: path.join(__dirname, 'target', groupName + '.html'),
    targetJsonPath: path.join(__dirname, 'target', groupName + '.json'),
    targetCssPath: path.join(__dirname, 'target', groupName + '.css'),
    emojiSize: 72,
    columns: 10,
    rows: 16,
    backgroundColor: '#FFFFFF',
    name: groupName
  }, next)
}, (err) => {
  if (err) {
    console.error(err)
    return
  }

  // Generate an index page to browse the generated sheets.
  const indexHtml = generateIndex(mojiGroups)
  const indexPath = path.join(__dirname, 'target', 'index.html')
  fs.writeFileSync(indexPath, indexHtml)

  console.log('Finished successfully.')
})
