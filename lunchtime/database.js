var redis = require('redis');
var db = redis.createClient();
var _ = require('underscore');

var config = require('./config.js');

var roundKey = 'currentround';
var voteKey = function(next) { getCurrentRound(function(err, val) { next(err, 'votes' + val); }); };
var winnerKey = function (next) { getCurrentRound(function (err, val) { next(err, 'winner' + val); }); };

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

var getVotes = function (next) {
  voteKey(function (err, key) {
    if (err) return next(err);

    return db.lrange(key, 0, -1, function(err, values) {
      var votes;

      if (err) votes = [];
      else {
        votes = _.map(values, function(v) { return JSON.parse(v); });
      }
      next(votes);
    });
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

var getWinner = function (next) {
  winnerKey(function(err, key) {
    if (err) return next(err);
    return db.get(key, function(err, value) {
      if (err) {
        next(err);
      } else {
        next(err, +value); //coerce winner value to number
      }
    });
  });
}

module.exports = {
  db: db,
  getVotes: getVotes,
  addVote: addVote,
  setWinner: setWinner,
  getWinner: getWinner,
  getCurrentRound: getCurrentRound,
  incrementCurrentRound: incrementCurrentRound
}