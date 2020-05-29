const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }));

  eleventyConfig.addCollection('posts', collection => {

    const _collection = collection.getFilteredByGlob('**/*.md').sort((a, b) => {
      if ((a.data.orderPath || a.filePathStem) < (b.orderPath || b.filePathStem)) return -1;
      else if ((a.data.orderPath || a.filePathStem) > (b.orderPath || b.filePathStem)) return 1;
      else return 0;
    })

    let currentGroup;

    _collection.forEach(entry => {
      let path = entry.inputPath.split('/');
      let group = path[path.length - 2];
      entry.data.level = path.length - 3;
      if (group !== currentGroup) entry.data.class = '__' + entry.data.level;
      currentGroup = group;
      entry.data.tag = entry.data.tags && entry.data.tags[0];
    })

    return _collection;
  });

};