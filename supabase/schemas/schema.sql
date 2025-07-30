-- Import all schema files in the correct order
-- This file is used to import all schema files in the correct order

-- First create tables
\ir competitions.sql
\ir teams.sql
\ir leagues.sql
\ir league_members.sql
\ir profile.sql
\ir matches.sql

-- Then create functions and triggers
\ir functions.sql

-- Finally create indexes
\ir indexes.sql 