const markdownIt = require("markdown-it")

const markdownItAnchor = require("markdown-it-anchor")

// .use(require('markdown-it-anchor'), opts)

module.exports = function (eleventyConfig) {
  
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor,{permalink: true}))

  eleventyConfig.addCollection('posts', collection => {

    const _collection = collection.getFilteredByGlob('**/*.md').sort(
      (a, b) => (a.data.orderPath || a.filePathStem).localeCompare((b.orderPath || b.filePathStem))
    )

    _collection.forEach(entry => {
      const path = entry.inputPath.split('/')

      entry.data.lv = path.length - 2

      entry.data.group && entry.data.lv--

      entry.data.tag = entry.data.tags && entry.data.tags[0]
    })

    return _collection
  })

}