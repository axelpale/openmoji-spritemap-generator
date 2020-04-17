module.exports = (composition, opts) => {
  const outputObj = {
    name: opts.groupName,
    columns: opts.columns,
    rows: opts.rows,
    width: opts.columns * opts.emojiSize,
    height: opts.rows * opts.emojiSize,
    emojiSize: opts.emojiSize,
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
