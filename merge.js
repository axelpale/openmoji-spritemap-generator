const sharp = require('sharp')
const mojis = require('./openmoji.json')
const imagemap = require('./imagemap')
const asyn = require('async')
const path = require('path')
const fs = require('fs')

sharp.cache(false)

const srcDir = path.resolve(__dirname, 'openmoji-72x72-color')
const tgtDir = path.resolve(__dirname, 'spritemaps')
const size = 72

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

// Remove

asyn.eachSeries(Object.keys(mojiGroups), (groupName, next) => {
  const mojiGroup = mojiGroups[groupName]

  const limitedGroup = mojiGroup.slice(0, 160)

  const composition = limitedGroup.map((moji, i) => {
    return {
      moji: moji, // For image map generation
      input: path.join(srcDir, moji.hexcode + '.png'),
      top: size * Math.floor(i / 10),
      left: size * (i % 10)
    }
  })

  // Skip non-existent files.
  asyn.filter(composition, (cmoji, callback) => {
    const p = cmoji.input
    fs.access(p, fs.constants.R_OK, (err) => {
      if (err) {
        console.log(`${p} is not readable`)
      }
      return callback(null, !err)
    })
  }, (err, foundComposition) => {
    if (err) {
      return next(err)
    }

    const n = foundComposition.length
    const m = mojiGroup.length

    console.log(`Merging ${n}/${m} images of ${groupName}...`)

    const tgtPath = path.join(tgtDir, groupName + '.png')
    sharp('background.png')
      .composite(foundComposition)
      .toFile(tgtPath, (err, info) => {
        if (err) {
          return next(err)
        }
        console.log('Finished merging ' + groupName)

        // Generate a boilerplate html image map
        console.log('Generating image map for ' + groupName)
        const imagemapPath = path.join(tgtDir, groupName + '.html')
        const imagemapHtml = imagemap(foundComposition, {
          groupName: groupName,
          size: size
        })
        fs.writeFile(imagemapPath, imagemapHtml, (errw) => {
          if (errw) {
            return next(err)
          }
          return next()
        })
      })
  })
}, (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log('Finished successfully.')
  }
})
