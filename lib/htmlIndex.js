const htmlBoiler = require('./htmlBoiler')

module.exports = (groups, opts) => {
  // Generate html index page to browse the sprite sheets.

  // Defaults
  opts = Object.assign({}, {
    mode: 'png'
  }, opts)

  let body = '<div>\n'
  body += '<h1>Generated Sprite Sheets</h1>\n'

  const fileLabels = [
    'Merged ' + opts.mode.toUpperCase() + ' image: ',
    'HTML image map: ',
    'CSS sprite sheet: ',
    'CSS sprite example: ',
    'Custom JSON: '
  ]

  body += Object.keys(groups).reduce((acc, groupName) => {
    const header = '<h2>' + groupName + '</h2>\n'
    const files = [
      groupName + '.' + opts.mode,
      groupName + '.html',
      groupName + '.css',
      groupName + '-css.html',
      groupName + '.json'
    ]
    const filesList = files.reduce((ac, f, i) => {
      const label = fileLabels[i]
      return ac + '  <li>' + label + '<a href="' + f + '">' + f + '</a></li>\n'
    }, '<ul>\n') + '</ul>'

    // Sprite image
    const img = '<img src="' + groupName + '.png" ' +
      'style="width: 12em;">\n'

    const c = '<div>' + img + filesList + '</div>'

    return acc + header + c
  }, '')

  // Disclaimer
  body += '<p><strong>Images licensed under ' +
    '<a href="https://creativecommons.org/licenses/by-sa/4.0/legalcode">' +
    'CC-BY-SA 4.0</a>.<br>\n ' +
    'Emojis by ' +
    '<a href="https://openmoji.org/">OpenMoji.org</a>.<br>\n' +
    'This page was generated with ' +
    '<a href="https://github.com/axelpale/openmoji-spritemap-generator">' +
    'axelpale/openmoji-spritemap-generator</a>.<br>\n' +
    '' + (new Date()).toISOString().substr(0, 10) +
    '</strong></p>'
  body += '</div>\n'

  return htmlBoiler(body, {
    title: 'Generated Sprite Sheets',
    headExtra: '<style>' +
      'body { font-family: sans-serif; }' +
      'ul { display: inline-block; list-style-type: none; }' +
      'img { vertical-align: top; }' +
      '</style>'
  })
}
