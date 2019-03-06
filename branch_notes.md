**Fixes**

The group symbol to show / hide layers in a group was bugged. This is fixed in this branch.

Streetview control in location view is now created with hyperHTML. Does no longer break table columns.

Empty groups are now hidden in location view.

Fix for filters. Current filter must be assigned to legend filter not the other way around.

Zoom to layer extent will now use filter.


**Changes**

Set zindex for svg in panes to 100 to prevent polygons drawn on top of images.

```
.leaflet-map-pane svg {
    z-index: 100;
}
```

Image control is no longer vertical with scroll but column.

Images are uploaded automatically.

Location geometries are drawn on the same pane.

The pane can be supplied as a style property to the location draw method.

**Reports**

Currently only one report.

Template: public/views/report.html
Script: public/js/views/report.js

Endpoint: routes/report.js

The report endpoint will check for token and require login for private endpoints if the token is not supplied in URL.

The report script stores URL param as report_params object.

The report is an infoj field `type: report` which will create a link to the report endpoint with URL params.

The report template has viewmode 'report' on the body. Locations will not be editable if the viewmode is report. Cluster are not selectable if the viewmode is report.

Location table entries and the report button itself will not be shown in the report view.

`hideInReport : true` fields will return immediately from the view update if the viewmode is 'report'.

