-- Mixed geometry types in EPSG:3857 with null geometries and null fields.
-- Coordinates are whole metres so that WKT output is deterministic.

CREATE TABLE example.features (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  geom GEOMETRY(Geometry, 3857)
);

CREATE INDEX features_geom_idx ON example.features USING GIST (geom);

INSERT INTO example.features (name, category, geom) VALUES
  ('Thames Path', 'path', ST_GeomFromText('LINESTRING(-20000 6710000,-10000 6712000)', 3857)),
  ('Hyde Park', 'park', ST_GeomFromText('POLYGON((-19000 6711000,-18000 6711000,-18000 6712000,-19000 6712000,-19000 6711000))', 3857)),
  ('Unnamed', NULL, ST_GeomFromText('POINT(-15000 6711500)', 3857)),
  ('Lost Park', 'park', NULL),
  ('Brandenburg Gate', 'landmark', ST_GeomFromText('POINT(1492000 6894000)', 3857));

-- A writable table for insert queries, eg. nonblocking queries.

CREATE TABLE example.log (
  id SERIAL PRIMARY KEY,
  msg TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
