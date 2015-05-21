var express = require('express');
var router = express.Router();
var _ = require('underscore');
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
          var votesFor = _.filter(votes, function(v) { return v.vote == c.id; });
          c.votes = votesFor.length;
          c.winner = !!winner && c.id == winner;
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

router.post('/vote', function (req, res) {
  var token = req.body.token.trim().toUpperCase();
  var voteid = req.body.voteid;

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
      res.redirect('/');
    });
  });
});

module.exports = router;