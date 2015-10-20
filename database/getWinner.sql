select winning_choice_id from "round"
where is_current = TRUE
order by id desc limit 1