-- An empty table for location create, update and delete tests.
-- Tests insert their own rows and must not depend on rows from other tests,
-- because all test files of a run share the database.

CREATE TABLE example.scratch_location (
  id SERIAL PRIMARY KEY,
  name TEXT,
  category TEXT,
  size INTEGER,
  -- A jsonb field updated by key with jsonb_field and jsonb_key infoj entries.
  props JSONB,
  -- A json field updated as object with json_field and json_key infoj entries.
  meta JSON,
  geom GEOMETRY(Point, 4326)
);
