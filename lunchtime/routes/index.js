var express = require('express');
var router = express.Router();
var _ = require('underscore');
var db = require('../database');

var config = require('../config.js');


router.get('/', function (req, res) {
  var errorOccurred = !!req.query.error;

  db.getVotes(function (votes) {

    db.getWinner(function (err, winner){

      var data = _.map(config.choices, function (c) {
        var votesFor = _.filter(votes, function (v) { return v.vote == c.id; })
        c.votes = votesFor.length;
        c.winner = !!winner && c.id == winner;
        return c;
      });

      res.render('index', {
        title: 'Raygun Lunchtime',
        data: data,
        errorOccurred: errorOccurred,
      });
    })
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
    if (_.find(votes, function (v) { return v.user === user.user })) {
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
      
      res.redirect('/');
    });
  });
});

module.exports = router;