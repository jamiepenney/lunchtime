var redis = require('redis');
var db = redis.createClient();
var _ = require('underscore');

var config = require('./config.js');

var voteKey = 'votes' + config.round;
var winnerKey = 'winner' + config.round;

var getVotes = function (next) {
  db.lrange(voteKey, 0, -1, function (err, values) {
    var votes;

    if (err) votes = [];
    else {
      votes = _.map(values, function (v) { return JSON.parse(v); });
    }
    next(votes);
  });
};

var addVote = function (vote, next) {
  db.rpush([voteKey, JSON.stringify(vote)], function (err) {
    next(err);
  });
};

var setWinner = function (winner, next) {
  db.set(winnerKey, winner, next);
};

var getWinner = function (next) {
  db.get(winnerKey, function (err, value) {
    if (err) {
      next(err);
    } else {
      next(err, +value); //coerce winner value to number
    }
  });
}

module.exports = {
  db: db,
  getVotes: getVotes,
  addVote: addVote,
  setWinner: setWinner,
  getWinner: getWinner
}