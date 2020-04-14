const sharp = require('sharp')
const htmlMap = require('./lib/htmlMap')
const jsonMap = require('./lib/jsonMap')
const path = require('path')
const fs = require('fs')

// Disabling sharp cache might help to avoid "Bus error: 10"
// when the number of images is high. This does only help, not prevent.
sharp.cache(false)

module.exports = (config, callback) => {
  // Define default config
  config = Object.assign({
    // The selected set of emojis from openmoji.json
    emojis: [],
    // Source of emoji images, named by hexcode
    emojiDir: path.resolve(__dirname, 'openmoji-72x72-color'),
    // Where to store the resulting spritemap
    targetImagePath: path.resolve(__dirname, 'emojis.png'),
    // Where to store the resulting image map html
    targetHtmlPath: path.resolve(__dirname, 'emojis.html'),
    // Where to store the resulting map data json (for custom usage)
    targetJsonPath: path.resolve(__dirname, 'emojis.json'),
    // Pixel width=height of emoji on the spritemap
    emojiSize: 72,
    // Dimensions of the spritemap
    columns: 10,
    rows: 16,
    // Background color. Transparent by default.
    backgroundColor: '#FFFFFF00',
    // Unique name for this emoji set. Affects console output and html classes.
    name: 'default-group'
  }, config)

  // All given emojis.
  const fullGroup = config.emojis

  // Create file path for each.
  const fullPathGroup = fullGroup.map((moji, i) => {
    return {
      moji: moji, // For image map generation
      input: path.join(config.emojiDir, moji.hexcode + '.png')
    }
  })

  // Skip emojis when no image is available
  const accessableGroup = fullPathGroup.filter(pmoji => {
    try {
      fs.accessSync(pmoji.input, fs.constants.R_OK)
      return true
    } catch (err) {
      console.log('Image not found: ' + pmoji.input)
      return false
    }
  })

  // Limit the number of emojis to fit the spritemap dimensions.
  // Too many emojis cause sharp to stack extra emojis in messy manner.
  const limitedGroup = accessableGroup.slice(0, config.columns * config.rows)

  // Convert emojis to a sharp composition.
  const composition = limitedGroup.map((pmoji, i) => {
    return {
      moji: pmoji.moji, // Original emoji data for image map generation.
      input: pmoji.input,
      top: config.emojiSize * Math.floor(i / config.columns),
      left: config.emojiSize * (i % config.columns),
      index: i
    }
  })

  // Note how many emojis were missing.
  const n = composition.length
  const m = fullGroup.length
  console.log(`Merging ${n}/${m} images...`)

  const width = config.emojiSize * config.columns
  const height = config.emojiSize * config.rows

  sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: config.backgroundColor
    }
  }).composite(composition)
    .toFile(config.targetImagePath, (err, info) => {
      if (err) {
        return callback(err)
      }
      console.log('Finished merging ' + config.name + '.')

      // Generate a boilerplate html image map
      console.log('Generating HTML image map...')
      const outputHtml = htmlMap(composition, {
        groupName: config.name,
        size: config.emojiSize
      })

      // Generate a data file for custom usage
      console.log('Generating JSON map data...')
      const outputJson = jsonMap(composition, {
      })

      try {
        fs.writeFileSync(config.targetHtmlPath, outputHtml)
        fs.writeFileSync(config.targetJsonPath, outputJson)
      } catch (errw) {
        return callback(errw)
      }

      // All success.
      return callback()
    })
}
