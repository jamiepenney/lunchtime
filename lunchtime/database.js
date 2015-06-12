var redis = require('redis');
var db = redis.createClient();
var _ = require('underscore');

var config = require('./config.js');

var roundKey = 'currentround';
var voteKeyStr = 'votes';
var winnerKeyStr = 'winner';
var voteKey = function(next) { getCurrentRound(function(err, val) { next(err, voteKeyStr + val); }); };
var winnerKey = function (next) { getCurrentRound(function (err, val) { next(err, winnerKeyStr + val); }); };

var getCurrentRound = function(next) {
  db.get(roundKey, function(err, value) {
    if (err) {
      next(err);
    } else {
      next(err, +value); //coerce round to a number
    }
  });
};

var incrementCurrentRound = function (next) {
  getCurrentRound(function (err, round) {
    if (err) {
      next(err);
    } else {
      db.set(roundKey, round + 1, next);
    }
  });
}

var getVotesByKey = function(key, next) {
  return db.lrange(key, 0, -1, function(err, values) {
    var votes;

    if (err) votes = [];
    else {
      votes = _.map(values, function(v) {
        var vote = JSON.parse(v);
        // coerce vote number to fix bad data
        vote.vote = +vote.vote;
        return vote;
      });
    }
    next(votes);
  });
};

var getVotesByRound = function (round, next) {
  var key = voteKeyStr + round;
  return getVotesByKey(key, next);
};

var getVotes = function (next) {
  voteKey(function(err, key) {
    if (err) return next(err);
    return getVotesByKey(key, next);
  });
};

var addVote = function (vote, next) {
  voteKey(function (err, key) {
    if (err) return next(err);
    return db.rpush([key, JSON.stringify(vote)], function (err) {
      next(err);
    });
  });
};

var setWinner = function (winner, next) {
  winnerKey(function(err, key) {
    if (err) return next(err);
    return db.set(key, winner, next);
  });
};

var getWinnerByRound = function (round, next) {
  return getWinnerByKey(winnerKeyStr + round, next);
}

var getWinnerByKey = function(key, next) {
  return db.get(key, function (err, value) {
    if (err) {
      next(err);
    } else {
      next(err, +value); //coerce winner value to number
    }
  });
}

var getWinner = function (next) {
  winnerKey(function(err, key) {
    if (err) return next(err);
    return getWinnerByKey(key, next);
  });
}

module.exports = {
  db: db,
  getVotes: getVotes,
  getVotesByRound: getVotesByRound,
  addVote: addVote,
  setWinner: setWinner,
  getWinner: getWinner,
  getWinnerByRound: getWinnerByRound,
  getCurrentRound: getCurrentRound,
  incrementCurrentRound: incrementCurrentRound
}