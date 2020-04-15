const mojis = require('./openmoji.json')
const asyn = require('async')
const merge = require('./index')
const path = require('path')

// Filter out those with long hexcode, like skin tones.
const shortMojis = mojis.filter(moji => moji.hexcode.length <= 5)

// Group by group name
const mojiGroups = shortMojis.reduce((acc, moji) => {
  const groupName = moji.group
  if (!acc[groupName]) {
    acc[groupName] = []
  }
  acc[groupName].push(moji)
  return acc
}, {})

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
  } else {
    console.log('Finished successfully.')
  }
})
