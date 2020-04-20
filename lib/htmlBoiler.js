module.exports = (html, opts) => {
  const title = opts.title ? opts.title : ''
  const headExtra = opts.headExtra ? opts.headExtra : ''

  return '<!doctype html>\n' +
    '<html>\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<title>' + title + '</title>\n' +
    headExtra +
    '\n</head>\n' +
    '<body>\n' +
    html +
    '\n</body>\n' +
    '</html>\n'
}
