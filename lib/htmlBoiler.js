module.exports = (html, opts) => {
  return '<!doctype html>\n' +
    '<html>\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<title>' + opts.title + '</title>\n' +
    opts.headExtra +
    '\n</head>\n' +
    '<body>\n' +
    html +
    '\n</body>\n' +
    '</html>\n'
}
