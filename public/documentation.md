# Documentation

#### Contents
##### [1. Introduction](#introduction)
##### [2. Map view and URL hooks](#map)
##### [3. Gazetteer](#gazetteer)
##### [4. Layers](#layers)
##### [5. Catchments](#catchments)

## [1. Introduction](#introduction)

Geolytix.xyz is a mapping web app designed to visualize and support outcome of spatial analysis carried out for a client. It is based on modular framework flexible for custom implementation and tailor-made analytical tools.

## [2. Map view and URL hooks](#map)

Map is the heart of the web app. It can be dragged and zoomed to desired location. Map extent is usually limited to selected country or region.

![alt text](https://user-images.githubusercontent.com/7070711/36906522-094477dc-1e2e-11e8-9828-7e3bab4fbdc3.png)

*Fig. 2.1. Map view with app options on the left side. From top to bottom: gazetteer module, geolocation, increase/decrease zoom, link to documentation, logout, admin panel for accounts with admin rights.*

All actions performed on the map will be tracked by the page URL where map view and all current settings will be stored as parameters. These will be also initially set if passed in the loaded URL.

![alt text](https://user-images.githubusercontent.com/7070711/36907015-5927f67e-1e2f-11e8-8698-dd6854690e2c.png)

*Fig. 2.2. URL with app settings stored as query parameters.*

## [3. Gazetteer](#gazetteer)

Gazetteer is a core module that finds a desired location such as point of interest, geographic area or address depending on configuration. Search results are filtered by selected country or region.

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

## [4. Layers](#layers)

The web app supports several types of layers:
- GeoJSON,
- Mapbox Vector Tiles,
- cluster,
- surface.

Available layers can be toggled active. Each layer has zoom levels set where layer becomes visible or hidden. It also supports different data sources for different zoom levels to allow cartographic generalization.

![alt text](https://user-images.githubusercontent.com/7070711/36932588-e25b5740-1ec2-11e8-99cb-fa0e3a0e95ec.png)

*Fig. 4.1. Layer manager view with loaded layers.*

Multiple features across layers can be selected and their information displayed.

![alt text](https://user-images.githubusercontent.com/7070711/36932785-8efdc1d8-1ec6-11e8-841b-25b5e47be3ca.png)

*Fig. 4.2. Selected features from two layers.*

### 4.1. GeoJSON.

GeoJSON layer is a generic interactive or non-interactive vector layer. Layer will be visible at allowed zoom levels and loaded from relevant data source. Features can be selected in order to display available information.

![alt text](https://user-images.githubusercontent.com/7070711/36932732-87c755c4-1ec5-11e8-91c1-682416bc467c.png)

*Fig. 4.1.1. GeoJSON layer with selected feature.*

### 4.2. Mapbox Vector Tiles

MVT layer is a tile layer served directly from PostgreSQL and constructed from geometry data. like GeoJSON, this layer supports interactivity, zoom ranges, generalization and multiple selection.
MVT layer supports categorized classification of features. Figure 4.2.1 shows retail places dataset with features categorized by retail place type.

![alt text](https://user-images.githubusercontent.com/7070711/36933494-88d22c94-1ed1-11e8-8500-095cf170aac4.png)

*Fig. 4.2.1. MVT layer with categorized features.*

### 4.3. Cluster

Cluster layer is a layer type designed to efficiently display dense point data with clustering logic based on zoom level. This layer also supports categorized legend with custom symbols.

![alt text](https://user-images.githubusercontent.com/7070711/36933582-7fe7a526-1ed3-11e8-9659-89bfa597e1a5.png)

*Fig. 4.3.1. Selected features from cluster layer showing retail points.*

A clustering marker will also hold information on competitors. Each visible ring of the marker stands for diversity of company brands inside the cluster.

![alt text](https://user-images.githubusercontent.com/7070711/33710879-da2aaa16-db39-11e7-85fd-e12f4a4d80b2.png)

*Fig. 4.3.2 Clustering markers with their competition rings.*

The URL will store information whether the locations module is enabled and specific location is selected.

Cluster layer also supports data editing and image upload, designed for site visits and on-site data collection.

![alt text](https://user-images.githubusercontent.com/7070711/36933884-621432c6-1ed8-11e8-921e-cb23b295137e.png)

*Fig. 4.3.3. Data editing form, example from Tokio, Japan..*

### 4.4. Grid Surface

Grid surface module manages visualization of data represented as a grid such as demography or demand. This layer type is non-interactive but fully customizable with its variables, colour palette and number of classes.

![alt text](https://user-images.githubusercontent.com/7070711/33710880-da5079e4-db39-11e7-90ad-7b3491480890.png)

*Fig. 4.4.1 Demographic grid surface in London area.*

Two selected variables are visualized as size and colour accompanied by 2-dimensional legend. Available variables are shown in two dropdown lists.


![alt text](https://user-images.githubusercontent.com/7070711/36933693-85dff06c-1ed5-11e8-9dfa-48ad394d2a1b.png)

*Fig. 4.4.2. Dropdown lists contain variables available for analysis and visualization.*

![alt text](https://user-images.githubusercontent.com/7070711/36933694-85f70ea0-1ed5-11e8-9f02-b8fc4a523af0.png)
*Fig. 4.4.3. Any two variables are selectable from dropdown lists.*

![alt text](https://user-images.githubusercontent.com/7070711/33710883-da9a1f0e-db39-11e7-9107-17c51a68bcb6.png)

*Fig. 4.4.4. Grid surface for the employed aged 25-29.*

Grid surface will support analysis for site comparison and planning.

## [5. Catchments](#catchments)

This module returns demographic profile of an area with given travel time and travel mode around a selected point.

![alt text](https://user-images.githubusercontent.com/7070711/36933790-f83e4ad6-1ed6-11e8-90f0-3809b1cd0f5d.png)

*Fig. 5.1. Catchment settings: walking or driving, travel time in minutes.*

![alt text](https://user-images.githubusercontent.com/7070711/36933791-f8572d58-1ed6-11e8-983a-618359b271c0.png)

*Fig. 5.2. Catchment isochrone representing 45 minutes of travel time driving around location in West London along with area demographic grid surface.*

Catchment GeoJSON object can be copied using `Copy to clipboard` button and reused within any other platform where GeoJSON format is supported. It can be pasted as a layer directly to QGIS.
