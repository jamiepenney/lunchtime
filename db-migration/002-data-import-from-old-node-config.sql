SELECT run_migration(2, $$
	INSERT INTO choice(id, name, added_in, removed_in)
	VALUES
	    ( 1, 'Rogue and Vagabond - Pizza', NULL, NULL ),
	    ( 2, 'Southern Cross', NULL, 6 ),
	    ( 3, 'Burger Fuel', NULL, NULL),
	    ( 4, 'R & S Satay House', NULL, NULL),
	    ( 5, 'Ekim Burger', NULL, NULL),
	    ( 6, 'Sushi Train', NULL, NULL),
	    ( 7, 'Tulsi - Curry', NULL, NULL),
	    ( 8, 'Aroy - Thai', NULL, NULL),
	    ( 9, 'The Oaks Noodle House - Thai', NULL, NULL),
	    ( 10, 'Little Penang - Malaysian', 6, NULL),
	    ( 11, 'JJ Murphy''s - Pub', 6, NULL),
	    ( 12, 'Auntie Meena''s - Vegetarian', 10, NULL ),
	    ( 13, 'Ram''s dumplings', 10, NULL),
	    ( 14, 'Heaven Pizza', 15, NULL ),
	    ( 15, 'Pizza Pomodoro at Goldings', 15, NULL);
$$);

-- select rollback_migration(2, $$
--  	DELETE FROM choice where id <= 15;
-- $$);