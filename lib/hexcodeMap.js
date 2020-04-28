module.exports = (composition) => {
  const hexcodes = composition.map(cmoji => cmoji.moji.hexcode)
  let script = 'module.exports = [\n'
  hexcodes.forEach(hexcode => {
    script += '  \'' + hexcode + '\',\n'
  })
  script += ']\n'
  return script
}
