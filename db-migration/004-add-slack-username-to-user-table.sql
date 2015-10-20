SELECT run_migration(4, $$
	ALTER TABLE "user" ADD COLUMN "slack_username" varchar(255);
$$);

-- SELECT rollback_migration(4, $$
-- 	ALTER TABLE "user" DROP COLUMN "slack_username";
-- $$);