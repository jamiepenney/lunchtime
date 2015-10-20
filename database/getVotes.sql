select v.id as id, v.choice_id as vote, c.name as choice_name, u.name as name from vote v
join "user" u on v.user_id = u.id
join choice c on v.choice_id = c.id
join round r on v.round_id = r.id
where r.is_current = TRUE