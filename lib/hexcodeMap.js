module.exports = (composition) => {
  const hexcodes = composition.map(cmoji => cmoji.moji.hexcode)
  let script = 'module.exports = [\n'
  hexcodes.forEach((hexcode, i) => {
    // Skip trailing comma if last entry
    if (i + 1 === hexcodes.length) {
      script += '  \'' + hexcode + '\'\n'
    } else {
      script += '  \'' + hexcode + '\',\n'
    }
  })
  script += ']\n'
  return script
}
