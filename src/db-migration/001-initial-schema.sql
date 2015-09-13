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

CREATE OR REPLACE FUNCTION rollback_migration(id integer, ddl text)
RETURNS VOID AS
$body$
BEGIN
	IF has_migration_run(id) THEN
		EXECUTE ddl;
		DELETE FROM migration where migration_id=id;
	END IF;	
END;
$body$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION run_migration(id integer, ddl text) RETURNS boolean AS $$
BEGIN
	IF has_migration_run(id) THEN
		RETURN FALSE;
	ELSE
		EXECUTE ddl;
		RETURN migration_finished(id) = FALSE;
	END IF;
END;
$$ LANGUAGE plpgsql STRICT;


SELECT run_migration(1, $$

	CREATE TABLE "user" (
		id integer PRIMARY KEY,
		name varchar(255) NOT NULL,
		token varchar(16) NOT NULL UNIQUE,
		is_admin boolean NOT NULL default FALSE
	);

	CREATE TABLE "round" (
		id serial PRIMARY KEY,
		is_current boolean NOT NULL default TRUE,
		winning_choice_id integer NULL,
		winning_vote_id integer NULL
	);

	CREATE TABLE "choice" (
		id serial PRIMARY KEY,
		name varchar(256) NOT NULL,
		-- Explicitly not including round foreign key here - they can reference rounds in the future
		added_in integer NULL,
		removed_in integer NULL
	);

	CREATE TABLE "vote" (
		id serial PRIMARY KEY,
		round_id integer NOT NULL REFERENCES "round",
		choice_id integer NOT NULL references "choice",
		user_id integer NOT NULL references "user",
		UNIQUE(round_id, user_id)
	);

	ALTER TABLE round ADD FOREIGN KEY (winning_vote_id) REFERENCES "vote" ON DELETE SET NULL;
	ALTER TABLE round ADD FOREIGN KEY (winning_choice_id) REFERENCES "choice";
$$);

-- SELECT rollback_migration(1, $$
-- 	DROP TABLE IF EXISTS "vote";
-- 	DROP TABLE IF EXISTS "choice";
-- 	DROP TABLE IF EXISTS "round";
-- 	DROP TABLE IF EXISTS "user";
-- $$);

