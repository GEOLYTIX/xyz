/**
 * @module /workspace/templates/queries
 */

// Import all templates and renders
import gazQuery from './gaz_query.js';
import getLastLocation from './get_last_location.js';
import distinctValues from './distinct_values.js';
import distinctValuesJson from './distinct_values_json.js';
import fieldStats from './field_stats.js';
import fieldMin from './field_min.js';
import fieldMax from './field_max.js';
import fieldMinmax from './field_minmax.js';
import getNnearest from './get_nnearest.js';
import geojson from './geojson.js';
import cluster from './cluster.js';
import clusterHex from './cluster_hex.js';
import wkt from './wkt.js';
import infotip from './infotip.js';
import layerExtent from './layer_extent.js';
import stIntersectsAb from './st_intersects_ab.js';
import stIntersectsCount from './st_intersects_count.js';
import stDistanceAb from './st_distance_ab.js';
import stDistanceAbMultiple from './st_distance_ab_multiple.js';
import locationGet from './location_get.js';
import locationNew from './location_new.js';
import locationDelete from './location_delete.js';
import locationsDelete from './locations_delete.js';
import locationUpdate from './location_update.js';
import locationsInsert from './locations_insert.js';
import locationCount from './location_count.js';
import mvt from './mvt.js';
import mvtGeom from './mvt_geom.js';

export default {
  gaz_query: {
    template: gazQuery,
  },
  get_last_location: {
    layer: true,
    render: getLastLocation,
  },
  distinct_values: {
    template: distinctValues,
  },
  distinct_values_json: {
    template: distinctValuesJson,
  },
  field_stats: {
    template: fieldStats,
  },
  field_min: {
    template: fieldMin,
  },
  field_max: {
    template: fieldMax,
  },
  field_minmax: {
    template: fieldMinmax,
  },
  get_nnearest: {
    render: getNnearest,
  },
  geojson: {
    layer: true,
    render: geojson,
  },
  cluster: {
    layer: true,
    render: cluster,
    reduce: true,
  },
  cluster_hex: {
    layer: true,
    render: clusterHex,
    reduce: true,
  },
  wkt: {
    layer: true,
    render: wkt,
    reduce: true,
  },
  infotip: {
    layer: true,
    render: infotip,
  },
  layer_extent: {
    layer: true,
    template: layerExtent,
  },
  st_intersects_ab: {
    template: stIntersectsAb,
  },
  st_intersects_count: {
    template: stIntersectsCount,
  },
  st_distance_ab: {
    template: stDistanceAb,
  },
  st_distance_ab_multiple: {
    template: stDistanceAbMultiple,
  },
  location_get: {
    layer: true,
    render: locationGet,
  },
  location_new: {
    layer: true,
    render: locationNew,
    value_only: true,
  },
  location_delete: {
    layer: true,
    render: locationDelete,
  },
  locations_delete: {
    layer: true,
    render: locationsDelete,
  },
  locations_insert: {
    layer: true,
    render: locationsInsert,
  },
  location_update: {
    layer: true,
    render: locationUpdate,
  },
  location_count: {
    layer: true,
    template: locationCount,
    value_only: true,
  },
  mvt: {
    layer: true,
    render: mvt,
    value_only: true,
  },
  mvt_geom: {
    layer: true,
    render: mvtGeom,
    value_only: true,
  },
};
