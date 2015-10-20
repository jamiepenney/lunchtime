select c.id, c.name, count(v.id) from choice c
join vote v on c.id = v.choice_id
where v.round_id = $1
group by c.id
order by count(v.id) desc
limit 1;
