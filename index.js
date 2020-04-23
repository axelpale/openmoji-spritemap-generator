const composePng = require('./lib/composePng')
const composeSvg = require('./lib/composeSvg')
const htmlMap = require('./lib/htmlMap')
const jsonMap = require('./lib/jsonMap')
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
    targetImagePath: path.resolve(__dirname, 'emojis.png'),
    // Where to store the resulting image map html
    targetHtmlPath: path.resolve(__dirname, 'emojis.html'),
    // Where to store the resulting map data json (for custom usage)
    targetJsonPath: path.resolve(__dirname, 'emojis.json'),
    // Where to store the resulting css sprite sheet
    targetCssPath: path.resolve(__dirname, 'emojis.css'),
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

  // Compatible with upper case mode
  config.mode = config.mode.toLowerCase()

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

    if (config.mode === 'png') {
      // Generate css sprite sheet for PNG map.
      // CSS for SVG is created by svg-sprite in the composer.
      console.log('Generating CSS sprite sheet...')
      const outputCss = styleMap(composition, {
        imageUrl: path.basename(config.targetImagePath),
        emojiSize: config.emojiSize
      })

      try {
        fs.writeFileSync(config.targetCssPath, outputCss)
      } catch (errw) {
        return callback(errw)
      }
    }

    // Generate css sprite sheet sample html
    console.log('Generating CSS sprite sheet sample HTML...')
    const outputCssHtml = styleHtmlMap(composition, {
      cssSrc: path.basename(config.targetCssPath)
    })

    try {
      fs.writeFileSync(config.targetHtmlPath, outputHtml)
      fs.writeFileSync(config.targetJsonPath, outputJson)

      const cssHtmlPath = config.targetCssPath.replace(/\.css$/, '-css.html')
      fs.writeFileSync(cssHtmlPath, outputCssHtml)
    } catch (errw) {
      return callback(errw)
    }

    // All success.
    return callback()
  })
}
