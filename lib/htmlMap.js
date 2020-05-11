module.exports = (composition, opts) => {
  // Options
  //   size: width (=height) in px
  //   groupName: a class to use
  //
  const mode = opts.mode.toLowerCase()
  const size = opts.size
  const id = 'openmoji-spritesheet-' + opts.groupName
  let html = '<map name="' + id + '">\n'

  html += composition.reduce((acc, component) => {
    const hexcode = component.moji.hexcode
    const annotation = component.moji.annotation
    const l = component.left
    const t = component.top
    const r = l + size
    const b = t + size
    const coords = l + ',' + t + ',' + r + ',' + b
    return acc + '  <area ' +
      'shape="rect" ' +
      'coords="' + coords + '" ' +
      'id="openmoji-sprite-' + hexcode + '" ' +
      'class="openmoji-sprite" ' +
      'data-hexcode="' + hexcode + '" ' +
      'href="#' + hexcode + '" ' +
      'alt="' + annotation + '" ' +
      'title="' + annotation + '" ' +
      '/>\n'
  }, '')

  html += '</map>\n'

  html += '<img usemap="#' + id + '" ' +
    'src="' + opts.groupName + '.' + mode + '" ' +
    'alt="' + opts.groupName + '" />\n'

  return html
}
