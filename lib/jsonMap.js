module.exports = (config, composition) => {
  const width = config.emojiSize * config.columns
  const height = config.emojiSize * config.rows

  const outputObj = {
    name: config.name,
    width: width,
    height: height,
    emojiSize: config.emojiSize,
    emojis: composition.map(cmoji => {
      return {
        emoji: cmoji.moji,
        top: cmoji.top,
        left: cmoji.left,
        index: cmoji.index
      }
    })
  }
  return JSON.stringify(outputObj, null, '  ')
}
