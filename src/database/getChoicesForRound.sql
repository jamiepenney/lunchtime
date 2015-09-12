select c.id, c.name, count(v.id) as votes from "choice" c
left outer join
(  select v.* from vote v
	join "round" r on v.round_id = r.id
	where r.id = $1
) as v on v.choice_id = c.id
where (c.added_in is null or c.added_in <= $1)
and (c.removed_in is null or c.removed_in >= $1)
group by c.id
order by c.id asc;