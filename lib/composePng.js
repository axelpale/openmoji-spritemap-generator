const sharp = require('sharp')

// Disabling sharp cache might help to avoid "Bus error: 10"
// when the number of images is high. This does only help, not prevent.
sharp.cache(false)

module.exports = (composition, config, callback) => {
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
    .toFile(config.basePath + '.png', (err, info) => {
      return callback(err, info)
    })
}
