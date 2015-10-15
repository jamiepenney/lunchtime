SELECT run_migration(5, $$
	INSERT INTO choice (id, name, added_in, removed_in)
	VALUES (16, 'BBQ on the deck', 26, NULL);
$$);

-- SELECT rollback_migration(5, $$
-- 	DELETE FROM "choice" WHERE id = 16;
-- $$);