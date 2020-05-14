module.exports = (composition, opts) => {
  const url = opts.imageUrl
  const size = opts.emojiSize
  let css = ''

  css += '.openmoji {\n' +
    '  display: inline-block;\n' +
    '  margin: 0;\n' +
    '  padding: 0;\n' +
    '  width: ' + size + 'px;\n' +
    '  height: ' + size + 'px;\n' +
    '  background-repeat: no-repeat;\n' +
    '}\n\n'

  composition.forEach(cmoji => {
    const x = cmoji.left
    const y = cmoji.top
    css += '.openmoji-' + cmoji.moji.hexcode + ' {\n' +
      '  background-image: url(\'' + url + '\');\n' +
      '  background-position: -' + x + 'px -' + y + 'px;\n' +
      '}\n'
  })

  return css
}
