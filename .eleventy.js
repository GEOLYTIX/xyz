const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }));

  eleventyConfig.addCollection('posts', collection => {

    const _collection = collection.getFilteredByGlob('**/*.md').sort(
      (a, b) => (a.data.orderPath || a.filePathStem).localeCompare((b.orderPath || b.filePathStem))
    )

    let currentGroup;

    _collection.forEach(entry => {
      const path = entry.inputPath.split('/');
      const group = path[path.length - 2];

      entry.data.lv = path.length - 2;

      group !== currentGroup && entry.data.lv--;
      currentGroup = group;

      entry.data.tag = entry.data.tags && entry.data.tags[0];
    })

    return _collection;
  });

};