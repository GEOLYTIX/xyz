const view_templates = require('./views')

const mail_templates = require('./mails')

const msg_templates = require('./msgs')

const merge = require('../utils/merge')

const cloudfront = require('../provider/cloudfront')

const file = require('../provider/file')

const getFrom = {
  https: async ref => {

    const response = await fetch(ref)

    if (ref.match(/\.json$/i)) {
      return await response.json()
    }
  
    return await response.text()
  },
  file: ref => file(ref.split(':')[1]),
  cloudfront: ref => cloudfront(ref.split(':')[1]),
}

const custom_templates = new Promise(async (resolve, reject)=>{

  if (!process.env.CUSTOM_TEMPLATES) return resolve({})

  resolve(await getFrom[process.env.CUSTOM_TEMPLATES.split(':')[0]](process.env.CUSTOM_TEMPLATES))
})

module.exports = async (key, language = 'en', params = {}) => {

  if (key === undefined) return;

  const templates = merge({},
    view_templates,
    mail_templates,
    msg_templates,
    await custom_templates)

  if (typeof key !== 'string') {

    console.warn('Template keys must be of type string.')
    return;
  }

  if (!Object.hasOwn(templates, key)) {

    console.warn(`Template key ${key} not found in templates`)

    return key;
  }

  let template =  templates[key]?.[language] || templates[key]?.en

  if (!template) {

    console.warn(`No language template for key ${found}`)

    return key;
  }

  if (typeof template === 'string') {

    // Template string has a valid getFrom method.
    if (getFrom[template.split(':')[0]] instanceof Function) {

      // Get template from method.
      template = await getFrom[template.split(':')[0]](template)
    }
  }

  // Return template which is of type string.
  if (typeof template === 'string') {

    return template.replace(/\{{2}(.*?)\}{2}/g,

      // Replace matched params in template string
      matched => params[matched.replace(/\{{2}|\}{2}/g, '')] || '')
  }

  // Template must be of type object at this stage.
  if (typeof template !== 'object') {

    console.warn(`Template ${key} must be an object type.`)
    return key
  }

  // Prevent prototype polluting assignment.
  Object.freeze(Object.getPrototypeOf(template));

  for (key in template) {

    // Template key / value is a string with a valid get method.
    if (typeof template[key] === 'string'
      && Object.hasOwn(getFrom, template[key].split(':')[0])) {

      // Assign template key value from method.
      template[key] = await getFrom[template[key].split(':')[0]](template[key])
    }

    // Template key value is still string after assignment
    if (typeof template[key] === 'string') {

      // Look for template params to be substituted.
      template[key] = template[key].replace(/\$\{{1}(.*?)\}{1}/g,

        // Replace matched params in string values
        matched => params[matched.replace(/\$\{{1}|\}{1}/g, '')] || '')
    }

  }

  return template
}