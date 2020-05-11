const svgSprite = require('svg-sprite')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

const postProcess = (mode, resourceType, targetPath, contents) => {
  // Modify output of svgSprite to fit our case.
  // DEBUG console.log(modeName, resourceKey, targetPath)

  // Add missing display rules
  if (mode === 'css' && resourceType === 'css') {
    // Buffer to utf-8 string, and then replace part.
    return contents.toString().replace(
      'background: url("',
      'display: inline-block;\nbackground: url("'
    )
  }

  // else
  return contents
}

module.exports = (composition, config, callback) => {
  // Compose SVG sprites.

  // For correct ordering, map hexcodes to indices
  const hexcodeToIndex = composition.reduce((acc, comp, i) => {
    acc[comp.moji.hexcode] = i
    return acc
  }, {})

  // See https://github.com/jkphl/svg-sprite
  const svgConfig = {
    dest: config.targetDir,
    log: null,
    shape: {
      id: {
        generator: (name, file) => {
          // Use hexcode as the id
          return path.basename(name, '.svg')
        }
      },
      sort: (a, b) => {
        // Attempt to sort emojis in same order as in composition. No luck.
        const ia = hexcodeToIndex[a.id]
        const ib = hexcodeToIndex[b.id]
        if (ia < ib) { return 1 }
        if (ia > ib) { return -1 }
        return 0
      }
    },
    mode: {
      css: {
        dest: '.', // put to target dir
        sprite: config.name + '.svg', // output sprite filename
        bust: false,
        prefix: '.openmoji-%s',
        dimensions: true,
        render: {
          css: {
            dest: config.basePath + '.css'
          }
        },
        // css specific
        layout: 'packed',
        common: 'openmoji'
      },
      view: false,
      defs: false,
      symbol: false,
      // symbol: {
      //   dest: '.', // use target dir
      //   sprite: path.basename(config.targetImagePath),
      //   bust: false
      // },
      stack: false
    }
  }

  const spriter = svgSprite(svgConfig)

  composition.forEach(comp => {
    const svgEmoji = fs.readFileSync(comp.input, { encoding: 'utf-8' })
    // Some reason file name is needed again?
    spriter.add(comp.input, comp.moji.hexcode + '.svg', svgEmoji)
  })

  spriter.compile((err, results) => {
    if (err) {
      return callback(err)
    }

    // Write resulting files to disk
    try {
      const modes = Object.keys(results)
      for (let i = 0; i < modes.length; i += 1) {
        const mode = modes[i]
        const resourceKeys = Object.keys(results[mode])
        for (let j = 0; j < resourceKeys.length; j += 1) {
          const k = resourceKeys[j]
          const resource = results[mode][k]
          const targetPath = resource.path
          const contents = resource.contents // a Buffer
          // Some adjustments to the output
          const processedContents = postProcess(mode, k, targetPath, contents)
          // Ensure dir
          mkdirp.sync(path.dirname(targetPath))
          // Write
          fs.writeFileSync(targetPath, processedContents)
        }
      }
    } catch (writeError) {
      return callback(writeError)
    }

    // Success
    callback()
  })
}
