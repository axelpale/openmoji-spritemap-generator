const htmlBoiler = require('./htmlBoiler')

module.exports = (composition, opts) => {
  // Options
  //   cssSrc: a relative path to the CSS sprite sheet.
  //
  let html = '<div>\n'

  html += composition.reduce((acc, component) => {
    const hexcode = component.moji.hexcode
    const annotation = component.moji.annotation
    return acc + '<span class="openmoji openmoji-' + hexcode + '" ' +
      'title="' + hexcode + ' – ' + annotation + '"></span>\n'
  }, '')

  html += '</div>\n'

  return htmlBoiler(html, {
    title: 'CSS Sprite Sheet Sample',
    headExtra: '<link href="' + opts.cssSrc + '" rel="stylesheet">'
  })
}
