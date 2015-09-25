select u.id, u.name, c.name as choice,
case when r.winning_choice_id = c.id then true else false end as winner,
case when r.winning_vote_id = v.id then true else false end as vote_winner
from vote v join "user" u on v.user_id = u.id
join choice c on v.choice_id = c.id
join round r on v.round_id = r.id
where v.round_id = $1