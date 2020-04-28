const composePng = require('./lib/composePng')
const composeSvg = require('./lib/composeSvg')
const htmlMap = require('./lib/htmlMap')
const jsonMap = require('./lib/jsonMap')
const hexcodeMap = require('./lib/hexcodeMap')
const styleMap = require('./lib/styleMap')
const styleHtmlMap = require('./lib/styleHtmlMap')
const path = require('path')
const fs = require('fs')

const composers = {
  png: composePng,
  svg: composeSvg
}

module.exports = (config, callback) => {
  // Define default config
  config = Object.assign({
    // The selected set of emojis from openmoji.json
    emojis: [],
    // Mode of operation
    mode: 'png',
    // Source of emoji images, named by hexcode
    emojiDir: path.resolve(__dirname, 'openmoji-72x72-color'),
    // Where to store the resulting spritemap
    targetDir: __dirname,
    // Unique name for this emoji set.
    // Generated are prefixed with this name.
    // Affects also console output and html classes.
    name: 'default-group',
    // Pixel width=height of emoji on the spritemap
    emojiSize: 72,
    // Number of emojis on a row. Height is determined from the given emojis.
    columns: 10,
    // Background color. Transparent by default.
    backgroundColor: '#FFFFFF00'
  }, config)

  // Compatible with upper case mode, e.g. 'SVG' or 'Png'
  config.mode = config.mode.toLowerCase()

  // Determine the number of rows needed.
  config.rows = Math.ceil(config.emojis.length / config.columns)

  // Build non-existing base path where to append tags and file extension.
  config.basePath = path.resolve(config.targetDir, config.name)

  // All given emojis.
  const fullGroup = config.emojis

  // Create file path for each.
  const extension = config.mode === 'svg' ? '.svg' : '.png'
  const fullPathGroup = fullGroup.map((moji, i) => {
    return {
      moji: moji, // For image map generation
      input: path.join(config.emojiDir, moji.hexcode + extension)
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

  // Convert emojis to a sharp composition.
  const composition = accessableGroup.map((pmoji, i) => {
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

  composers[config.mode](composition, config, (err) => {
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
    console.log('Generating JSON data sheet...')
    const outputJson = jsonMap(composition, {
      groupName: config.name,
      columns: config.columns,
      rows: config.rows,
      emojiSize: config.emojiSize
    })

    // Generate a hexcode index for quick copy-paste usage
    console.log('Generating hexcode module...')
    const outputHexcodeJs = hexcodeMap(composition)

    if (config.mode === 'png') {
      // Generate css sprite sheet for PNG map.
      // CSS for SVG is created by svg-sprite in the composer.
      console.log('Generating CSS sprite sheet...')
      const outputCss = styleMap(composition, {
        imageUrl: config.name + '.png',
        emojiSize: config.emojiSize
      })

      try {
        fs.writeFileSync(config.basePath + '.css', outputCss)
      } catch (errw) {
        return callback(errw)
      }
    }

    // Generate css sprite sheet sample html
    console.log('Generating CSS sprite sheet sample HTML...')
    const outputCssHtml = styleHtmlMap(composition, {
      cssSrc: config.name + '.css'
    })

    try {
      fs.writeFileSync(config.basePath + '.html', outputHtml)
      fs.writeFileSync(config.basePath + '.json', outputJson)
      fs.writeFileSync(config.basePath + '-css.html', outputCssHtml)
      fs.writeFileSync(config.basePath + '-hexcodes.js', outputHexcodeJs)
    } catch (errw) {
      return callback(errw)
    }

    // All success.
    return callback()
  })
}
