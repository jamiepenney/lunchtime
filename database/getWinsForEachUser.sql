select u.id, u.name, count(v.id) as wins from "user" u
left outer join 
(
	select v.* from vote v
	join round r on v.round_id = r.id
	where r.winning_choice_id = v.choice_id
)as v on v.user_id = u.id
where u.archived = false
group by u.id order by wins desc;