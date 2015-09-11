CREATE TABLE IF NOT EXISTS "user" (
	id serial PRIMARY KEY,
	name varchar(255) NOT NULL,
	token varchar(16) NOT NULL,
	is_admin boolean NOT NULL default FALSE
);

CREATE TABLE IF NOT EXISTS "round" (
	id serial PRIMARY KEY,
	is_current boolean NOT NULL default TRUE,
	winner_id integer NOT NULL REFERENCES "user"
);

CREATE TABLE IF NOT EXISTS "vote" (
	id serial PRIMARY KEY,
	round_id integer NOT NULL REFERENCES "round",
	choice_id integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "choice" (
	id serial PRIMARY KEY,
	name varchar(256) NOT NULL,
	added_in integer NULL REFERENCES "round",
	removed_in integer NULL REFERENCES "round"
);


-- Migration stuff

CREATE TABLE IF NOT EXISTS "migration" (
	migration_id integer UNIQUE NOT NULL
);

CREATE OR REPLACE FUNCTION has_migration_run(id integer)
RETURNS boolean AS
$body$
BEGIN
	RETURN EXISTS (
		SELECT * FROM migration WHERE migration_id=id
	);
END;
$body$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION migration_finished(id integer)
RETURNS boolean AS
$body$
DECLARE
	"run" boolean;
BEGIN
	"run" := has_migration_run(id);
	INSERT INTO migration (migration_id)
	SELECT id
	WHERE NOT EXISTS (
		SELECT * FROM migration WHERE migration_id=id
	);
	RETURN run;
END;
$body$
LANGUAGE plpgsql;

SELECT migration_finished(1);