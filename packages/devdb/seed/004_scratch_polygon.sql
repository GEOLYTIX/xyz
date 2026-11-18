-- Polygons for the location create and delete tests of an mvt layer with wkt_properties.
-- The polygons are EPSG:3857 squares around London in the scratch locale view.
-- Each name is a distinct value for a distributed theme on the name field.
-- Tests which create a polygon must delete it again, so the table holds the seeded rows only.

CREATE TABLE example.scratch_polygon (
  id SERIAL PRIMARY KEY,
  name TEXT,
  geom_3857 GEOMETRY(Polygon, 3857)
);

CREATE INDEX scratch_polygon_geom_3857_idx ON example.scratch_polygon USING GIST (geom_3857);

INSERT INTO example.scratch_polygon (name, geom_3857) VALUES
  ('North', ST_MakeEnvelope(-15000, 6715000, -5000, 6725000, 3857)),
  ('East', ST_MakeEnvelope(0, 6705000, 10000, 6715000, 3857)),
  ('South', ST_MakeEnvelope(-15000, 6690000, -5000, 6700000, 3857)),
  ('West', ST_MakeEnvelope(-35000, 6705000, -25000, 6715000, 3857));
