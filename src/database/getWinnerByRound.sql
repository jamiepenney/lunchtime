select r.winning_choice_id as id, c.name from "round" r
join choice c on c.id = r.winning_choice_id
where r.id = $1