var express = require('express');
var router = express.Router();
var _ = require('underscore');
var async = require('async');
var db = require('../database');

var config = require('../config.js');
var choices = require('../choices.js');


router.get('/', function (req, res) {
  var errorOccurred = !!req.query.error;

  db.getCurrentRound(function(err, currentRound) {
    db.getVotes(function(votes) {

      db.getWinner(function(err, winner) {

        var data = _.chain(choices.list)
        .filter(function (c) {
          // skip choices added in a future round or removed in a round before this one.
          return (!c.addedIn || c.addedIn <= currentRound)
              && (!c.removedIn || c.removedIn >= currentRound);
          })
        .map(function (c) {
          var votesFor = _.filter(votes, function(v) { return v.vote === c.id; });
          c.votes = votesFor.length;
          c.winner = !!winner && c.id === winner;
          return c;
        }).value();

        res.render('index', {
          title: 'Raygun Lunchtime',
          data: data,
          round: currentRound,
          errorOccurred: errorOccurred,
          token: req.signedCookies.token
        });
      });
    });
  });
});

var mapVoteToChoice = function(vote) {
  var choice = _.find(choices.list, function(ch) {
     return ch.id === vote;
  });
  return !!choice ? choice.name : 'Unknown';
}

var getRoundData = function(round, votes, winner) {
  var usersData = _.map(votes, function(vote) {
    return {
      name: vote.user,
      choice: mapVoteToChoice(vote.vote),
      winner: winner === vote.vote
    };
  });
  var popular = _.chain(votes).countBy(function(v) { return v.vote; }).pairs().max(function(arr) { return arr[1]; }).value()[0];
  return {
    users: usersData,
    round: round,
    winner: mapVoteToChoice(winner),
    popular: mapVoteToChoice(+popular)
  };
};

var getNumberOfWins = function(results) {
  var userWins = {};
  _.forEach(config.users, function(u) {
    userWins[u.user] = 0;
  });
  _.forEach(results, function(result) {
    _.forEach(result.users, function (user) {
      if (user.winner) {
        userWins[user.name] = (userWins[user.name] || 0) + 1;
      }
    });
  });

  return _.chain(userWins).map(function(wins, name) {
    return { wins: wins, name: name };
  }).sortBy('wins').reverse().value();
}

router.get('/stats', function (req, res) {
  var token = req.signedCookies.token;
  var isAdmin = _.any(config.users, function(u) { return u.token === token && u.isAdmin; });
  db.getCurrentRound(function (err, currentRound) {
    db.getWinnerByRound(currentRound, function(err, winner) {
      var latestRound = isAdmin || winner !== 0 ? currentRound : currentRound - 1;
      var roundRange = _.range(latestRound, 0, -1);
      async.mapSeries(roundRange, function(round, cb) {
        db.getVotesByRound(round, function(votes) {
          db.getWinnerByRound(round, function(err, winner) {
            if (err) {
              return cb({ users: [], round: round, winner: 0 });
            }
            return cb(null, getRoundData(round, votes, winner));
          });
        });
      }, function(err, results) {
        res.render('stats', {
          title: 'Raygun Lunchtime Stats',
          rounds: results,
          userWins: getNumberOfWins(results),
          error: err
        });
      });
    });
  });
});

router.post('/vote', function (req, res) {
  var token = req.body.token.trim().toUpperCase();
  var voteid = +req.body.voteid;

  var users = config.users;

  var user = _.find(users, function(t) { return t.token === token; });
  if (!user) {
    setTimeout(function () {
      res.status(403).send("Bad user, no donut!").end();
    }, 2000);

    return;
  }

  db.getVotes(function(votes) {
    if (_.find(votes, function (v) { return v.user === user.user; })) {
      setTimeout(function () {
        res.status(400).send("You can't vote twice!").end();
      }, 1000);
      return;
    }

    db.addVote({ user: user.user, vote: voteid }, function (err) {
      if (err) {
        res.status(500).end();
        return;
      }
      
      // Store the token in the user's cookies for next week
      res.cookie('token', token, { signed: true });
      res.cookie('username', user.user, { signed: true });
      res.redirect('/');
    });
  });
});

module.exports = router;