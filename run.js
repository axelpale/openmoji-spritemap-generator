// This runner is meant for customisation and to give an example of
// how multiple sprite sheets can be created with a single command.
//
const mojis = require('./openmoji.json')
const asyn = require('async')
const generate = require('./index')
const generateIndex = require('./lib/htmlIndex')
const path = require('path')
const fs = require('fs')

const MODE = 'png' // out of { 'svg', 'png' }
const EMOJI_DIR_NAME = {
  png: 'openmoji-72x72-color',
  svg: 'openmoji-svg-color'
}

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

// Limit all groups to 8 * 16 emojis to avoid bus error 10.
Object.keys(mojiGroups).forEach(groupName => {
  mojiGroups[groupName] = mojiGroups[groupName].slice(0, 128)
})

// For each group, run sheet generator.
// Sheet generation is asynchronous operation, thus @caolan/async is used.
asyn.eachSeries(Object.keys(mojiGroups), (groupName, next) => {
  const mojiGroup = mojiGroups[groupName]
  generate({
    mode: MODE,
    name: groupName,
    emojis: mojiGroup,
    emojiDir: path.join(__dirname, EMOJI_DIR_NAME[MODE]),
    targetDir: path.join(__dirname, 'target'),
    emojiSize: 72,
    columns: 8
  }, next)
}, (err) => {
  if (err) {
    console.error(err)
    return
  }

  // Generate an index page to browse the generated sheets.
  const indexHtml = generateIndex(mojiGroups, {
    mode: MODE
  })
  const indexPath = path.join(__dirname, 'target', 'index.html')
  fs.writeFileSync(indexPath, indexHtml)

  console.log('Finished successfully.')
})
