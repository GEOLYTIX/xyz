---
title: Cluster
tags: [workspace]
layout: root.html
---

# Cluster layer

Cluster layer are point layers. [A combination of PostGIS cluster algorithm](https://medium.com/@goldrydigital/cluster-f-x-nesting-postgresql-kmeans-in-dbscan-for-responsive-maps-9ed99590a439) are applied by the XYZ backend in order to display aggregate cluster for large point location datasets in the map control.

It is possible to select individual locations from an aggregate cluster and theme the cluster based on their aggregate scores.

The size of a cluster represents the count of locations which are aggregated into a cluster.

## **Cluster parameter**

The cluster algorithm which is used to aggregate locations can be specified with additional cluster parameter.

`"cluster_kmeans": 0.05`

**cluster_kmeans** defines the minimum number of cluster. The number is determined by 1 over the kmeans value \(eg. KMeans 0.05 will generate a minimum number of 20 cluster\). The XYZ backend will adjusted KMeans by the absolute number of locations in a map view. The KMeans value can be altered through the cluster panel. _The default value is 0.5._ **A lower KMeans value will produce more cluster.**

`"cluster_dbscan": 0.01`

**cluster_dbscan** defines the maximum distance between locations in a cluster. The applied value is a ratio of the cross distance across the map view (eg. DBScan 0.01 with 10km cross distance of the map view will set the maximum distance between locations to 100 meter). _The default value is 0.01._ **A higher DBScan value will produce more cluster.**

Layer will be drawn by default on zIndex: 10.