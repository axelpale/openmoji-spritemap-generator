module.exports = (composition, opts) => {
  const outputObj = {
    name: opts.groupName,
    columns: opts.columns,
    rows: opts.rows,
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
