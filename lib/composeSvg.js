const svgSprite = require('svg-sprite')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

module.exports = (composition, config, callback) => {
  // See https://github.com/jkphl/svg-sprite
  const svgConfig = {
    dest: path.dirname(config.targetImagePath),
    log: null,
    mode: {
      css: true, // Create only for the background-position method
      view: false,
      defs: false,
      symbol: false,
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
          const contents = resource.contents
          // Ensure dir
          mkdirp.sync(path.dirname(targetPath))
          // Write
          fs.writeFileSync(targetPath, contents)
        }
      }
    } catch (writeError) {
      return callback(writeError)
    }

    // Success
    callback()
  })
}
