select c.id, c.name, r.winning_choice_id = c.id as winner, count(v.id) as votes from choice c
join round r on r.id = $1
left outer join vote v on v.choice_id = c.id and v.round_id = $1
where (c.added_in is null or c.added_in <= $1)
and (c.removed_in is null or c.removed_in >= $1)
group by c.id, r.winning_choice_id
order by c.id asc;