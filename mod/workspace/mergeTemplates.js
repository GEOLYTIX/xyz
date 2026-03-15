/**
## /workspace/mergeTemplates

The workspace is cached in the module scope to allow for the mergeObjectTemplates(layer) method to assign template objects defined in a JSON layer to the workspace.templates{}.

@requires /utils/roles
@requires /utils/merge
@requires /utils/envReplace
@requires /workspace/getTemplate
@requires /workspace/cache

@module /workspace/mergeTemplates
*/

import envReplace from '../utils/envReplace.js';
import merge from '../utils/merge.js';
import * as Roles from '../utils/roles.js';
import workspaceCache from './cache.js';
import getTemplate from './getTemplate.js';

let workspace;

/**
@function mergeTemplates
@async

@description
The mergeTemplates method will be called for a layer or locale obj.

The locale or layer object will be merged with a template defined as obj.template string property.

The method will check for a template matching the obj.key string property if obj.template is undefined.

An array of templates can be defined as obj.templates[]. The templates will be merged into the obj in the order the template keys are in the templates[] array.

@param {Object} obj
@param {array} [roles] An array of user roles from request params.

@property {string} [obj.template] Key of template for the object.
@property {string} obj.key Fallback for lookup of template if not an implicit property.
@property {array} [obj.templates] An array of template keys to be merged into the object.

@returns {Promise} The layer or locale provided as obj param.
*/
export default async function mergeTemplates(obj, roles) {
  // Cache workspace in module scope for template assignment.
  workspace = await workspaceCache();

  obj.roles ??= {};

  if (obj.role) {
    obj.roles[obj.role] ??= true;
  }

  // Process templates with the object's original role identity as context.
  const context = getRoleContext(obj);

  if (typeof obj.template === 'string' || obj.template instanceof Object) {
    obj = await objTemplate(obj, obj.template, roles, context);
    if (obj instanceof Error) return obj;
  } else if (Array.isArray(obj.templates)) {
    for (const _template of obj.templates) {
      obj = await objTemplate(obj, _template, roles, context);
    }
  } else if (obj.templates instanceof Object) {
    const err = `${obj.key} Object must be a templates Array.`;
    obj.err ??= [];
    obj.err.push(err);
    console.warn(err);
  }

  // Substitute ${SRC_*} in object string.
  obj = envReplace(obj);

  // Assign templates to workspace.
  assignWorkspaceTemplates(obj);

  // Assign default workspace dbs if not defined in template.
  obj.dbs ??= workspace.dbs;

  //If the user is an admin we don't need to check roles
  if (!Roles.check(obj, roles)) {
    return new Error('Role access denied.');
  }

  return obj;
}

/**
@function objTemplate
@async

@description
The method will request a template object from the getTemplate module method.

Possible error from the template fetch will be added to the obj.err[] array before the obj is returned.

The template will be checked against the request user roles.

The method will shortcircuit if roles restrict access to the template object.

Otherwise the obj will be merged into the template.

Templates defined in the obj.templates array will be merged into object.

@param {Object} obj
@param {Object} template The template maybe an object with a src property or a string.
@param {array} roles An array of user roles from request params.
@param {Object} [context] Optional base roles for context.
@property {string} [obj.template] Key of template for the object.

@returns {Promise<Object>} Returns the merged obj.
*/
async function objTemplate(obj, template, roles, context) {
  template = await getTemplate(template);

  // Failed to get template matching obj.template from template.src!
  if (template instanceof Error) {
    obj.err ??= [];
    obj.err.push(template.message);
    return obj;
  }

  template = structuredClone(template);

  // Combine roles using the static context if provided, otherwise the current object state.
  Roles.combine(template, context || obj);

  if (roles !== true && !Roles.check(template, roles)) {
    if (obj.template) {
      obj.roles = {
        ...template.roles,
        ...obj.roles,
      };
    }
    return obj;
  }

  template = prepareTemplate(obj, template, roles);

  let nextTemplates;
  let nextTemplatesContext;

  ({ obj, nextTemplates, nextTemplatesContext } = mergeObjectWithTemplate(
    obj,
    template,
  ));

  return await processRecursiveTemplates(
    obj,
    nextTemplates,
    roles,
    nextTemplatesContext,
  );
}

/**
@function prepareTemplate

@description
Prepares a template for merging by applying role-based property overrides and filtering properties based on include/exclude lists.

@param {Object} obj The parent object providing include/exclude property configuration.
@param {Object} template The template to prepare.
@param {Array|boolean} roles User roles for role-specific property merging.

@returns {Object} The prepared template with role overrides applied and properties filtered.
*/
function prepareTemplate(obj, template, roles) {
  template = Roles.objMerge(template, roles);

  //use the base obj exclude/include props as we need that for the templateProperties method.
  template.exclude_props = obj.exclude_props ?? template.exclude_props;
  template.include_props = obj.include_props ?? template.include_props;

  return templateProperties(template);
}

/**
@function mergeObjectWithTemplate

@description
Merges a template into the parent object. Handles two cases:

1. obj.template (singular): The object inherits from a single template. The obj is merged on top of the template.
2. templates[] array item: A template from the array is merged into the existing object.

When a template from the templates[] array has its own nested sub-templates, the template's role context is captured before the merge. This prevents sibling template roles from leaking into the sub-template role combinations.

Similarly, when a template contributes a locales array, the template's role context is stored as localesRoleContext on the merged object. This allows getLocale to scope role combinations for nested locales to the template that defined them, rather than the fully accumulated parent.

@param {Object} obj The parent object to merge the template into.
@param {Object} template The resolved template object.

@returns {Object} An object containing the merged obj, any nextTemplates to process, and an optional nextTemplatesContext scoped to the template's roles.
*/
function mergeObjectWithTemplate(obj, template) {
  let nextTemplates;
  let nextTemplatesContext;

  if (obj.template) {
    // obj.template must NOT overwrite template.template.
    delete obj.template;
    // Merge obj --> template
    obj = merge(template, obj);

    if (obj.templates) {
      nextTemplates = obj.templates;
      delete obj.templates;
    }
  } else {
    if (Array.isArray(template.templates)) {
      nextTemplates = template.templates;
      delete template.templates;

      // Capture the template's role context before merging into obj.
      // This ensures nested sub-templates are combined only with
      // their parent template's roles, not accumulated sibling roles.
      nextTemplatesContext = getRoleContext(template);
    }

    // When a template contributes a locales array, capture its role context
    // so that nested locales are combined only with the template's roles,
    // not accumulated sibling template roles.
    if (Array.isArray(template.locales)) {
      template.localesRoleContext = getRoleContext(template);
    }

    // template.role must NOT overwrite obj.role.
    if (Object.hasOwn(obj, 'role')) delete template.role;

    // template.key must NOT overwrite obj.key.
    delete template.key;

    // template.template must NOT overwrite obj.template.
    delete template.template;

    // Merge template --> obj
    obj = merge(obj, template);
  }

  return { obj, nextTemplates, nextTemplatesContext };
}

/**
@function processRecursiveTemplates
@async

@description
Processes any remaining templates that need to be merged after the initial template merge.

If the merged object now has an obj.template property, it is processed as a single template inheritance.

If nextTemplates exist (from a template's own templates[] array), they are processed sequentially using the nextTemplatesContext. This scoped context ensures that sub-templates are combined only with their parent template's roles, preventing sibling template roles from polluting the role hierarchy.

For example, given templates: [demographics, stores] where stores has templates: [brand_a], the brand_a template will be combined with the stores role context only, not with the accumulated demographics roles.

@param {Object} obj The current merged object.
@param {Array} [nextTemplates] Templates to process recursively.
@param {Array|boolean} roles User roles or true for admin.
@param {Object} [nextTemplatesContext] Role context scoped to the parent template, used to prevent sibling role leakage.

@returns {Promise<Object>} The fully merged object.
*/
async function processRecursiveTemplates(
  obj,
  nextTemplates,
  roles,
  nextTemplatesContext,
) {
  if (obj.template) {
    return await objTemplate(obj, obj.template, roles, getRoleContext(obj));
  } else if (Array.isArray(nextTemplates)) {
    // Use the template's own role context if available, so that nested
    // sub-templates are combined only with their parent template's roles
    // rather than the accumulated roles of the entire object.
    const context = nextTemplatesContext || getRoleContext(obj);
    for (const _template of nextTemplates) {
      obj = await objTemplate(obj, _template, roles, context);
    }
  }
  return obj;
}

/**
@function getRoleContext

@description
Extracts the role-related properties from an object to provide a stable context for template processing.

Used in two ways:
1. Captured from the parent object before iterating its templates[] array, preventing sibling templates from leaking roles into each other.
2. Captured from a template before merging it into the parent, so that the template's own sub-templates are scoped to the template's roles rather than the accumulated parent roles.

@param {Object} obj The object to extract role context from.
@returns {Object} A context object containing role, roles, localeRole, templateRole, and objRole.
*/
function getRoleContext(obj) {
  return {
    role: obj.role,
    roles: structuredClone(obj.roles),
    localeRole: obj.localeRole,
    templateRole: obj.templateRole,
    objRole: obj.objRole,
  };
}

/**
@function assignWorkspaceTemplates


@description
The method parses an object for a template object property.

The template property value will be assigned to the workspace.templates{} object matching the template key value.

The template._type property will be set to 'template' indicating that the templates origin is in the workspace.

It is possible to overassign _type:'core' templates which are loaded from the /mod/workspace/templates directory.

The method will call itself for nested objects.

@param {Object} obj
*/
function assignWorkspaceTemplates(obj) {
  // Return early if object is null or empty
  if (obj === null) return;

  if (obj instanceof Object && !Object.keys(obj)) return;

  Object.entries(obj).forEach((entry) => {
    // Process template objects - if found, add type and merge into workspace templates
    if (entry[0] === 'template' && entry[1].key) {
      entry[1]._type = 'template';
      workspace.templates[entry[1].key] = Object.assign(
        workspace.templates[entry[1].key] || {},
        entry[1],
      );
      return;
    }

    // Recursively process each item if we find an array
    if (Array.isArray(entry[1])) {
      entry[1].forEach(assignWorkspaceTemplates);
      return;
    }

    // Recursively process nested objects
    if (entry[1] instanceof Object) {
      assignWorkspaceTemplates(entry[1]);
    }
  });
}

/**
@function templateProperties

@description
The method checks whether the template object has an array property include_props and will iterate through the string entries in the array to remove all other properties from the template object.

Properties defined in the template object exclude_props array property will removed from the template object.
@param {Object} template
@property {array} template.include_props Remove all but these properties from template object.
@property {array} template.exclude_props Remove these properties from template object.
@returns {Object} template
*/
function templateProperties(template) {
  if (Array.isArray(template.exclude_props)) {
    for (const prop of template.exclude_props) {
      if (template.hasOwnProperty(prop)) {
        delete template[prop];
      }
    }
  }
  if (Array.isArray(template.include_props)) {
    const _template = {};
    for (const prop of template.include_props) {
      if (template.hasOwnProperty(prop)) {
        _template[prop] = template[prop];
      }
    }
    return _template;
  }
  return template;
}
