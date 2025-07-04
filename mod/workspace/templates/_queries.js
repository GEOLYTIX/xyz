/**
 * @module /workspace/templates/queries
 */

// Import all templates and renders
import cluster from './cluster.js';
import clusterHex from './cluster_hex.js';
import distinctValues from './distinct_values.js';
import distinctValuesJson from './distinct_values_json.js';
import fieldMax from './field_max.js';
import fieldMin from './field_min.js';
import fieldMinmax from './field_minmax.js';
import fieldStats from './field_stats.js';
import gazQuery from './gaz_query.js';
import geojson from './geojson.js';
import getNnearest from './get_nnearest.js';
import getRandomLocation from './get_random_location.js';
import histogram from './histogram.js';
import infotip from './infotip.js';
import layerExtent from './layer_extent.js';
import locationCount from './location_count.js';
import locationDelete from './location_delete.js';
import locationFieldValue from './location_field_value.js';
import locationGet from './location_get.js';
import locationNew from './location_new.js';
import locationUpdate from './location_update.js';
import locationsDelete from './locations_delete.js';
import mvt from './mvt.js';
import mvtGeom from './mvt_geom.js';
import sql_table_insert from './sql_table_insert.js';
import stDistanceAb from './st_distance_ab.js';
import stDistanceAbMultiple from './st_distance_ab_multiple.js';
import stIntersectsAb from './st_intersects_ab.js';
import stIntersectsCount from './st_intersects_count.js';
import wkt from './wkt.js';

export default {
  cluster: {
    layer: true,
    reduce: true,
    render: cluster,
  },
  cluster_hex: {
    layer: true,
    reduce: true,
    render: clusterHex,
  },
  distinct_values: {
    template: distinctValues,
  },
  distinct_values_json: {
    template: distinctValuesJson,
  },
  layer_extent: {
    layer: true,
    render: layerExtent,
    value_only: true,
    statement_timeout: 10000,
  },
  field_max: {
    template: fieldMax,
  },
  field_min: {
    template: fieldMin,
  },
  field_minmax: {
    template: fieldMinmax,
  },
  field_stats: {
    template: fieldStats,
  },
  gaz_query: {
    template: gazQuery,
  },
  geojson: {
    layer: true,
    render: geojson,
  },
  get_random_location: {
    layer: true,
    render: getRandomLocation,
  },
  get_nnearest: {
    render: getNnearest,
  },
  histogram: {
    layer: true,
    render: histogram,
  },
  infotip: {
    layer: true,
    render: infotip,
  },
  location_count: {
    layer: true,
    template: locationCount,
    value_only: true,
  },
  location_delete: {
    layer: true,
    render: locationDelete,
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
  location_update: {
    layer: true,
    render: locationUpdate,
  },
  locations_delete: {
    layer: true,
    render: locationsDelete,
  },
  location_field_value: {
    layer: true,
    render: locationFieldValue,
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
  sql_table_insert: {
    layer: true,
    render: sql_table_insert,
  },
  st_distance_ab: {
    template: stDistanceAb,
  },
  st_distance_ab_multiple: {
    template: stDistanceAbMultiple,
  },
  st_intersects_ab: {
    template: stIntersectsAb,
  },
  st_intersects_count: {
    template: stIntersectsCount,
  },
  wkt: {
    layer: true,
    reduce: true,
    render: wkt,
  },
};
