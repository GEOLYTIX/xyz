---
title: Roles
tags: [workspace]
layout: root.html
---

# Roles

Roles allow to restrict access to locales or layers.

Roles are defined as an object. The key being the role name. For locales the value must be truthful but does not have any other effect.

```
roles: {
  admin: true
}
```

Users who have the admin role will be able to see this locale.

## Role filter

The role value may be a filter object for layers. A filter set as the role value will be applied to any SQL query for this layer. User who do not have any matching layer role will not be able to see the layer at all.

```
roles: {
  uk: {
    country: {
      match: "uk"
    }
  }
}
```

User with the role 'uk' in their token will have a SQL match filter for the value 'uk' on the field 'country' applied to all queries for this layer.

# Language versions

User can select language from the list of supported languages in the login form. Workspace content can be displayed in relevant language versions. Concept of roles can be applied to locale and / or layer availability dependent on selected language.

This is the list of currently supported languages.

| code  | language | original | note
| --- | ----------- |
| en | English | * | default | 
| de | German | Deutsch | |
| fr | French | Français | |
| pl | Polish | Polski | |
| ja | Japanese | 日本語 | |
| ko | Korean | 한국어 | |
| zh | Chinese | 中文简体 | |

Codes adhere to ISO 639-1 norm of language codes.
*Please note these are keys reserved to language versions within `"roles"` object.*

In order to define an element as Japanese write:

```json
"roles": {
	"ja": null
}
```

In order to restrict an element from Japanese language write:

```json
"roles": {
	"!ja": null
}
```