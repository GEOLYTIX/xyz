---
title: Groups
tags: [configure]
layout: root.html
---

`infoj` entries can be grouped for a more structured visual display in the location's info drawer.

```text
"infoj": [
  {
    "label": "Group A",
    "type": "group",
    "expanded": true
  },
  {
    "group": "Group A",
    "label": "Size",
    "field": "size_sqm",
    "type": "integer"
  },
  {...}
]
```

Groups are created by defining an entry as `"type" : "group"`. **A group must have a unique label**. Any subsequent entry can be added to a previously defined group by assigning the group's label to the `group` key of the entry that should be added to the group.

By default, groups are displayed in a collapsed state that shows just the group label and hides all its entries. To overwrite this behaviour, set the group's `expanded` option to `true`.