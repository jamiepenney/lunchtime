var config = require('./config.js');
var pg = require('pg');
var fs = require('fs');
var path = require('path');

var cfg = config.pg;

pg.on('notice', function(msg) {
  console.log("notice: %j", msg);
});

pg.on('error', function(msg) {
  console.log("error: %j", msg);
});

var getCurrentRound = function(next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }

    var query = 'select * from "round" where is_current = TRUE order by id desc limit 1';
    client.query({text: query}, function(err, result) {
      next(err, result.rows[0]);
      done();
    });
  });
};

var incrementCurrentRound = function (next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var query = 'update round set is_current=FALSE;\n' +
                'insert into round(is_current) VALUES(TRUE) returning id;';
    client.query({text: query}, function(err, result){
      next(err, result != null ? result.rows[0] : {});
      done();
    });
  });
};

var getChoicesForRoundQuery = fs.readFileSync(path.join(__dirname, 'database/getChoicesForRound.sql'), 'utf-8');
var getChoicesForRound = function(round, next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var values = [round];
    	client.query({text: getChoicesForRoundQuery, values: values}, function(err, result){
		    next(err, result.rows);
        done();
  	});
  });
};

var getVotesByRoundQuery = fs.readFileSync(path.join(__dirname, 'database/getVotesByRound.sql'), 'utf-8');
var getVotesByRound = function(round, next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var values = [round];
      client.query({text: getVotesByRoundQuery, values: values}, function(err, result){
        next(err, result.rows);
        done();
    });
  });
};

var getVotesQuery = fs.readFileSync(path.join(__dirname, 'database/getVotes.sql'), 'utf-8');
var getVotes = function (next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    client.query({text: getVotesQuery}, function(err, result){
      next(err, result != null ? result.rows : []);
      done();
    });
  });
};

var hasVotedInRound = function(user, roundId, next) {
  if(!user) {
    next(null, false);
    return;
  }
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var hasVotedQuery = 'select count(1) from "vote" where user_id = $1 and round_id = $2';
    client.query({text: hasVotedQuery, values: [user.id, roundId]}, function(err, result){
      next(err, result != null ? result.rows[0].count > 0 : false);
      done();
    });
  });
}

var addVote = function (vote, next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    getCurrentRound(function(err, round){
      if(err) { done(); return next(err); }
      var query = 'insert into vote(round_id, choice_id, user_id) values($1, $2, $3)\n '+
                  'on conflict on constraint vote_round_id_user_id_key do update set choice_id = $2\n '+
                  'RETURNING *';
      var values = [round.id, vote.choice_id, vote.user_id];
      client.query({text: query, values: values}, function(err, result){
        next(err, result != null ? result.rows[0] : {});
        done();
      });
    });
  });
};

var setWinner = function (winner, next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    getCurrentRound(function(err, round){
      if(err) { done(); return next(err); }
      var query = 'update round set winning_vote_id = $1, winning_choice_id = $2 where id = $3';
      var values = [winner.vote_id, winner.choice_id, round.id];
      client.query({text: query, values: values}, function(err, result){
        next(err, {});
        done();
      });
    })
  });
};

var getFavouriteByRoundQuery = fs.readFileSync(path.join(__dirname, 'database/getFavouriteByRound.sql'), 'utf-8');
var getFavouriteByRound = function (round, next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var values = [round];
    client.query({text: getFavouriteByRoundQuery, values: values}, function(err, result){
      next(err, result.rows[0]);
      done();
  	});
  });
}

var getWinnerByRoundQuery = fs.readFileSync(path.join(__dirname, 'database/getWinnerByRound.sql'), 'utf-8');
var getWinnerByRound = function (round, next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var values = [round];
    client.query({text: getWinnerByRoundQuery, values: values}, function(err, result){
      next(err, result.rows[0]);
      done();
  	});
  });
}

var getWinnerQuery = fs.readFileSync(path.join(__dirname, 'database/getWinner.sql'), 'utf-8');
var getWinner = function (next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    client.query({text: getWinnerQuery}, function(err, result){
      next(err, result.rows[0].winning_choice_id);
      done();
  	});
  });
}

var getUserByToken = function(token, next){
  if(!token) {
    next('No token specified', null);
    return;
  }
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var query = 'select * from "user" where token = $1 limit 1';
    var values = [token];
    client.query({text: query, values: values}, function(err, result){
      next(err, result.rows[0]);
      done();
  	});
  });
};

var getUserByName = function(name, next){
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var query = 'select * from "user" where name = $1 limit 1';
    var values = [name];
    client.query({text: query, values: values}, function(err, result){
      next(err, result.rows[0]);
      done();
  	});
  });
};


var getWinsForEachUserQuery = fs.readFileSync(path.join(__dirname, 'database/getWinsForEachUser.sql'), 'utf-8');
var getWinsForEachUser = function(next){
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    client.query({text: getWinsForEachUserQuery}, function(err, result){
      next(err, result.rows);
      done();
  	});
  });
};

var getStatsForRoundQuery = fs.readFileSync(path.join(__dirname, 'database/getStatsForRound.sql'), 'utf-8');
var getStatsForRound = function(round, next){
  pg.connect(cfg, function queryStats(err, client, done) {
    if(err) { done(); return next(err); }
    var values = [round];
    client.query({text: getStatsForRoundQuery, values: values}, function(err, result){
      if (err) { done(); return next(err); }
      var stats = result.rows;

      getWinnerByRound(round, function(err, winner) {
        if (err) { done(); return next(err); }
        else {
          getFavouriteByRound(round, function(err, favourite){
            if (err) { done(); return next(err); }

            var winnerName = winner ? winner.name : "";
            var favName = favourite ? favourite.name : "";
            next(null, {users: stats, round: round, winner: winnerName, popular: favName});
            done();
          });
        }
      });
  	});
  });
};

var getChoice = function (choice, next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    var query = 'select * from choice where id = $1 limit 1;';
    var values = [choice];
    client.query({text: query, values: values}, function(err, result){
      next(err, result.rows[0]);
      done();
  	});
  });
}

module.exports = {
  getStatsForRound: getStatsForRound,
  getChoice: getChoice,
  getWinsForEachUser: getWinsForEachUser,
  getUserByToken: getUserByToken,
  getChoicesForRound: getChoicesForRound,
  getVotes: getVotes,
  getVotesByRound: getVotesByRound,
  addVote: addVote,
  setWinner: setWinner,
  getWinner: getWinner,
  getWinnerByRound: getWinnerByRound,
  getCurrentRound: getCurrentRound,
  incrementCurrentRound: incrementCurrentRound,
  hasVotedInRound: hasVotedInRound
}