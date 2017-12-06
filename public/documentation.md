# Documentation

#### Contents
##### [1. Introduction](#introduction)
##### [2. Map view and URL hooks](#map)
##### [3. Gazetteer](#gazetteer)
##### [4. Locations](#locations)
##### [5. Grid surface](#grid)
##### [6. Drivetimes](#drivetimes)
##### [7. Statistics](#stats)
##### [8. Reporting](#report)

## [1. Introduction](#introduction)

Geolytix.xyz is a mapping web app designed to visualize and support outcome of spatial analysis carried out for a client. It is based on modular framework flexible for custom implementation and tailor-made analytical tools.

## [2. Map view and URL hooks](#map)

Map is the heart of the web app. It can be dragged and zoomed to desired location. Map extent is usually limited to selected country.

![alt text](https://user-images.githubusercontent.com/7070711/33601749-13ef74ca-d9a5-11e7-8590-69ae67c6d6b1.png)*Fig. 2.1. Map view with app options on the left side. From top to bottom: gazetteer module, increase/decrease zoom, export to PDF, link to documentation, logout, admin panel for accounts with admin rights.*

All actions performed on the map will be tracked by the page URL where map view and all current settings will be stored as parameters. These will be also initially set if passed in the loaded URL.

![alt text](https://user-images.githubusercontent.com/7070711/33601750-14074c4e-d9a5-11e7-8a82-f19a59194b13.png)*Fig. 2.2. URL with app settings stored as query parameters.*

## [3. Gazetteer](#gazetteer)

Gazetteer is a core module that finds a desired location such as point of interest, geographic area or address depending on configuration. Search results are filtered by selected country.

![alt text](https://user-images.githubusercontent.com/7070711/33601751-141ebcda-d9a5-11e7-9475-c6cbaadc9d42.png)*Fig. 3.1. Country selection.*

While typing in the search field gazetteer will match and list up to 10 best results such as name of a place, postal code, geographic area name or a street address returned by relevant data source.

![alt text](https://user-images.githubusercontent.com/7070711/33601752-1434ffe0-d9a5-11e7-91fd-704e8d04c711.png)*Fig. 3.2. Gazetteer results listing geographic areas.*

![alt text](https://user-images.githubusercontent.com/7070711/33601753-144d64fe-d9a5-11e7-8e36-9748ee3e95b8.png)*Fig. 3.3. Gazetteer results listing postal areas and districts.*

On selection the map view will be set to selected geography.

![alt text](https://user-images.githubusercontent.com/7070711/33601754-14653d54-d9a5-11e7-84ec-a2aff5ecbe40.png)*Fig. 3.4. Map view with SW11 postal district highlighted in green by gazetteer.*

## [4. Locations](#locations)

Locations is a module that manages point of interest data. In this example the module contains retail points geocoded by Geolytix.

![alt text](https://user-images.githubusercontent.com/7070711/33601756-147bb5b6-d9a5-11e7-85be-a2c00d52b4c9.png)*Fig. 4.1. Locations module shows details of a selected store. `Zoom to Location` will move the map to center the selected point in the viewport.*

Location markers can be styled depending on their attributes. `Figure 4.1` shows retail points styled according to their fascias.

On lower zoom levels locations will cluster so as to keep the map clean and legible.

![alt text](https://user-images.githubusercontent.com/7070711/33601757-14945468-d9a5-11e7-884f-3170c143ee50.png)*Fig. 4.2. When cluster marker ic clicked it returns list of contained locations.*

A clustering marker will also hold information on competitors. Each visible ring of the marker stands for diversity of company brands inside the cluster.

![alt text](https://user-images.githubusercontent.com/7070711/33601758-14a983ba-d9a5-11e7-991f-865620e43b68.png)*Fig. 4.3. Clustering markers with their rings.*

The URL will store information whether the locations module is enabled and specific location is selected.

## [5. Grid surface](#grid)

Grid surface module manages visualization of data represented as a grid such as demography or demand.

![alt text](https://user-images.githubusercontent.com/7070711/33601759-14d2900c-d9a5-11e7-9dcb-46177f3cdb3a.png)*Fig. 5.1. Demographic grid surface in London area.*

Two selected variables are visualized as size and colour accompanied by 2-dimensional legend. Available variables are shown in two dropdown lists.

![alt text](https://user-images.githubusercontent.com/7070711/33601761-14e987d0-d9a5-11e7-8d26-76c7d86893e1.png)*Fig. 5.2. Dropdown lists contain variables available for analysis and visualization.*

![alt text](https://user-images.githubusercontent.com/7070711/33601762-15059934-d9a5-11e7-9d62-5aedac42c2dc.png)*Fig. 5.3. Any two variables are selectable from dropdown lists.*

![alt text](https://user-images.githubusercontent.com/7070711/33601764-151afd7e-d9a5-11e7-96f8-c455b8eb2219.png)*Fig. 5.4. Grid surface for the employed aged 25-29.*

Grid surface will support analysis for site comparison and planning.

## [6. Drivetimes](#drivetimes)

This module returns demographic profile of an area with given travel time and travel mode around a selected point.

![alt text](https://user-images.githubusercontent.com/7070711/33601765-1530befc-d9a5-11e7-984c-c5dab218a2bf.png)*Fig. 6.1. Drivetimes settings.*

![alt text](https://user-images.githubusercontent.com/7070711/33601766-158653da-d9a5-11e7-8fa9-1937a4574539.png)*Fig. 6.2. Drivetime isochrone representing 33 minutes of travel time driving around location in Kensington in London along with area demographic statistics.*

Drivetimes GeoJSON object can be copied using `Copy to clipboard` button and reused within any other platform where GeoJSON format is supported. It can be pasted as a layer directly to QGIS.

## [7. Statistics](#stats)

This module manages data as interactive vector layers. When selected a vector feature sends its data as a table. There may be several vector layers specified for different zoom levels.

Vector layers can be loaded as GeoJSON or as Mapbox Vector Tiles directly from PostgreSQL endpoint.

![alt text](https://user-images.githubusercontent.com/7070711/33601767-159e3fb8-d9a5-11e7-9d05-b50744a5fcac.png)*Fig. 7.1. Area statistics displayed for a selected postal sector in South West London.*

Displayed vector layer source and selected feature will be stored in page URL.

## [8. Reporting](#report)

The app can export its data as a PDF document. At any time PDF can be generated containing all information displayed by app modules.

![alt text](https://user-images.githubusercontent.com/7070711/33601768-15b5c958-d9a5-11e7-8ac2-4bf44fc1fc17.png)*Fig. 8.1. Exported report with selected location and grid surface for employed 2011 population.*
