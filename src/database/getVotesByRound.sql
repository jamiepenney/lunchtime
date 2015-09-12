select v.id as id, c.name as choice_name, v.choice_id as vote, u.name as user from vote v
join "user" u on v.user_id = u.id
join "choice" c on v.choice_id = c.id
join "round" r on v.round_id = r.id
where r.id = $1