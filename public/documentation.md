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

![alt text](https://user-images.githubusercontent.com/7070711/33710871-d971da36-db39-11e7-8062-8fb5a77eb425.png)
*Fig. 2.1. Map view with app options on the left side. From top to bottom: gazetteer module, increase/decrease zoom, export to PDF, link to documentation, logout, admin panel for accounts with admin rights.*

All actions performed on the map will be tracked by the page URL where map view and all current settings will be stored as parameters. These will be also initially set if passed in the loaded URL.

![alt text](https://user-images.githubusercontent.com/7070711/33710872-d986da26-db39-11e7-8c51-7df64aef5a4c.png)
*Fig. 2.2. URL with app settings stored as query parameters.*

## [3. Gazetteer](#gazetteer)

Gazetteer is a core module that finds a desired location such as point of interest, geographic area or address depending on configuration. Search results are filtered by selected country.

![alt text](https://user-images.githubusercontent.com/7070711/33710873-d99f1fe6-db39-11e7-86d6-a82e37831873.png)
*Fig. 3.1. Country selection.*

While typing in the search field gazetteer will match and list up to 10 best results such as name of a place, postal code, geographic area name or a street address returned by relevant data source.

![alt text](https://user-images.githubusercontent.com/7070711/33710874-d9c5db68-db39-11e7-8cc3-286967d833db.png)
*Fig. 3.2. Gazetteer results listing geographic areas.*

![alt text](https://user-images.githubusercontent.com/7070711/33710875-d9dabefc-db39-11e7-819f-f671b42b6876.png)
*Fig. 3.3. Gazetteer results listing postal areas and districts.*

On selection the map view will be set to selected geography.

![alt text](https://user-images.githubusercontent.com/7070711/33710876-d9ee2aaa-db39-11e7-8d27-127bcfa035ff.png)
*Fig. 3.4. Map view with SW11 postal district highlighted in green by gazetteer.*

## [4. Locations](#locations)

Locations is a module that manages point of interest data. In this example the module contains retail points geocoded by Geolytix.

![alt text](https://user-images.githubusercontent.com/7070711/33710877-da030f42-db39-11e7-97fe-0629a28f4e6c.png)
*Fig. 4.1. Locations module shows details of a selected store. `Zoom to Location` will move the map to center the selected point in the viewport.*

Location markers can be styled depending on their attributes. `Figure 4.1` shows retail points styled according to their fascias.

On lower zoom levels locations will cluster so as to keep the map clean and legible.

![alt text](https://user-images.githubusercontent.com/7070711/33710878-da16c4a6-db39-11e7-8a80-64d16cdac3fc.png)
*Fig. 4.2. When cluster marker ic clicked it returns list of contained locations.*

A clustering marker will also hold information on competitors. Each visible ring of the marker stands for diversity of company brands inside the cluster.

![alt text](https://user-images.githubusercontent.com/7070711/33710879-da2aaa16-db39-11e7-85fd-e12f4a4d80b2.png)
*Fig. 4.3. Clustering markers with their rings.*

The URL will store information whether the locations module is enabled and specific location is selected.

## [5. Grid surface](#grid)

Grid surface module manages visualization of data represented as a grid such as demography or demand.

![alt text](https://user-images.githubusercontent.com/7070711/33710880-da5079e4-db39-11e7-90ad-7b3491480890.png)
*Fig. 5.1. Demographic grid surface in London area.*

Two selected variables are visualized as size and colour accompanied by 2-dimensional legend. Available variables are shown in two dropdown lists.

![alt text](https://user-images.githubusercontent.com/7070711/33710881-da6cba6e-db39-11e7-813e-c43955093204.png)
*Fig. 5.2. Dropdown lists contain variables available for analysis and visualization.*

![alt text](https://user-images.githubusercontent.com/7070711/33710882-da803ed6-db39-11e7-80ac-9a162f0879c4.png)
*Fig. 5.3. Any two variables are selectable from dropdown lists.*

![alt text](https://user-images.githubusercontent.com/7070711/33710883-da9a1f0e-db39-11e7-9107-17c51a68bcb6.png)
*Fig. 5.4. Grid surface for the employed aged 25-29.*

Grid surface will support analysis for site comparison and planning.

## [6. Drivetimes](#drivetimes)

This module returns demographic profile of an area with given travel time and travel mode around a selected point.

![alt text](https://user-images.githubusercontent.com/7070711/33710884-daae3c00-db39-11e7-8a4a-09f0ac641e27.png)
*Fig. 6.1. Drivetimes settings.*

![alt text](https://user-images.githubusercontent.com/7070711/33710885-dac47b3c-db39-11e7-997a-519fda0cf861.png)
*Fig. 6.2. Drivetime isochrone representing 33 minutes of travel time driving around location in Kensington in London along with area demographic statistics.*

Drivetimes GeoJSON object can be copied using `Copy to clipboard` button and reused within any other platform where GeoJSON format is supported. It can be pasted as a layer directly to QGIS.

## [7. Statistics](#stats)

This module manages data as interactive vector layers. When selected a vector feature sends its data as a table. There may be several vector layers specified for different zoom levels.

Vector layers can be loaded as GeoJSON or as Mapbox Vector Tiles directly from PostgreSQL endpoint.

![alt text](https://user-images.githubusercontent.com/7070711/33710886-dad9aa66-db39-11e7-94e3-13a841d10820.png)
*Fig. 7.1. Area statistics displayed for a selected postal sector in South West London.*

Displayed vector layer source and selected feature will be stored in page URL.

## [8. Reporting](#report)

The app can export its data as a PDF document. At any time PDF can be generated containing all information displayed by app modules.

![alt text](https://user-images.githubusercontent.com/7070711/33710887-daef1af4-db39-11e7-9933-7d3880b28195.png)
*Fig. 8.1. Exported report with selected location and grid surface for employed 2011 population.*
