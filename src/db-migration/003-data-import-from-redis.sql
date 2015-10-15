SELECT run_migration(3, $$

	INSERT INTO "user"(id, name, token, is_admin)
	VALUES
	(1, 'Alex', 'AAAAAAAA', FALSE),
	(2, 'Kyle', 'BBBBBBBB', FALSE);

	INSERT INTO "round"(id, winning_choice_id)
	VALUES  (1, 1),(2, NULL);

	UPDATE "round" set is_current = TRUE where id = 2;

	INSERT INTO vote(round_id, user_id, choice_id)
	VALUES
	    (1, 2, 1), -- Kyle
	    (1, 1, 1); -- Alex
$$);
 
-- SELECT ROLLBACK_MIGRATION(3, $$
--    TRUNCATE TABLE vote CASCADE;
--    TRUNCATE TABLE round CASCADE;
--    TRUNCATE TABLE "user" CASCADE;
-- $$);