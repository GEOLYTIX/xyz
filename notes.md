# 3.2.0

Documentation is now included.

Grouped layers - now can be displayed all at once.

Query API to accept statement_timeout param.

Lib Dataviews create to accept plugins for chartjs.

Location removeCallback.

Blog view.

Geometry entry - now supports query property.

Infoj - entries now use "title" property. To use toolip set "tooltip", checkboxes retain "name" property. Aligns with dataviews and columns setup. This is a disruptive change - requires update to all infoj configurations.

Isoline settings for locations - fixed layout broken by display: flex of the container.

now.json to include all public files not just views.

Gazetteer endpoint - results now returned from multiple datasets. Previously - more datasets searched when no results found.

Gazetteer searchbox - entries have now source label.

Settings for isolines - now wrapped in expandable group-style container.

Isolines - restored support for "meta" entry - so that custom isolines have keep their metadata.