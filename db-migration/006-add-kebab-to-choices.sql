SELECT run_migration(6, $$
	INSERT INTO choice (id, name, added_in, removed_in)
	VALUES (17, 'Kebabs', 33, NULL);
$$);

-- SELECT rollback_migration(6, $$
-- 	DELETE FROM "choice" WHERE id = 17;
-- $$);