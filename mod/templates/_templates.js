const view_templates = require('./views')

const mail_templates = require('./mails')

const msg_templates = require('./msgs')

const merge = require('lodash/merge')

const cloudfront = require('../provider/cloudfront')

const file = require('../provider/file')

const fetch = require('node-fetch')

//const custom_templates = require('./custom')

const custom_templates = new Promise(async (resolve, reject)=>{

  if (!process.env.CUSTOM_TEMPLATES) return resolve({})

  try {

    const response = await fetch(process.env.CUSTOM_TEMPLATES)

    resolve(await response.json())

  } catch(err) {

    console.error(err)
    resolve({})
  }

})

const getFrom = {
  https: async ref => {

    const response = await fetch(ref)
  
    return await response.text()
  },
  file: ref => file(ref.split(':')[1]),
  cloudfront: ref => cloudfront(ref.split(':')[1]),
}

module.exports = async (name, language = 'en', params = {}) => {

  if (!name) return;

  const templates = merge({}, view_templates, mail_templates, msg_templates, await custom_templates)

  let template = templates[name] && (templates[name][language] || templates[name].en)

  if (!template) return;

  if (typeof template === 'string' && getFrom[template.split(':')[0]]) {

    template = await getFrom[template.split(':')[0]](template)
  }
 
  if (typeof template === 'object') {

    for (key in template) {

      if (typeof template[key] === 'string' && getFrom[template[key].split(':')[0]]) {

        template[key] = await getFrom[template[key].split(':')[0]](template[key])

      }

    }

  }

  // Return template which is of type string.
  if (typeof template === 'string') return template.replace(/\$\{(.*?)\}/g,

    // Replace matched params in template string
    matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  // Iterate through obkect keys of template
  Object.keys(template).forEach(key => {
    if (typeof template[key] !== 'string') return;

    // Replace matched params in string values
    template[key] = template[key].replace(/\$\{(.*?)\}/g,
      matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  })

  return template
}