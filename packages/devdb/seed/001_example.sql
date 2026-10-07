-- Example data for testing and coding examples.
-- Files in this directory are executed in alphabetical order when a new database is created.
-- The postgis extension is created before the seed files are executed.

CREATE SCHEMA IF NOT EXISTS example;

CREATE TABLE example.locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  geom GEOMETRY(Point, 4326) NOT NULL
);

CREATE INDEX locations_geom_idx ON example.locations USING GIST (geom);

INSERT INTO example.locations (name, category, geom) VALUES
  ('Geolytix', 'office', ST_SetSRID(ST_MakePoint(-0.1276, 51.5072), 4326)),
  ('Paris', 'city', ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)),
  ('Berlin', 'city', ST_SetSRID(ST_MakePoint(13.4050, 52.5200), 4326)),
  ('Madrid', 'city', ST_SetSRID(ST_MakePoint(-3.7038, 40.4168), 4326));
