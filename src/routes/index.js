var express = require('express');
var router = express.Router();
var _ = require('underscore');
var async = require('async');
var db = require('../database');

var config = require('../config.js');


router.get('/', function (req, res) {
  var errorOccurred = !!req.query.error;

  db.getCurrentRound(function(err, currentRound) {
    db.getVotesByRound(currentRound.id, function(err, votes) {
      db.getWinner(function(err, winner) {
        db.getChoicesForRound(currentRound.id, function(err, choices){
          res.render('index', {
            title: 'Raygun Lunchtime',
            data: choices,
            round: currentRound.id,
            errorOccurred: errorOccurred,
            token: req.signedCookies.token
          });
        });
      });
    });
  });
});

router.get('/stats', function (req, res) {
  var token = req.signedCookies.token;
  db.getUserByToken(token, function(err, user){
    var isAdmin = user != null ? user.is_admin : false;
    db.getCurrentRound(function (err, currentRound) {
      db.getWinsForEachUser(function(err, userWins) {
        var latestRound = isAdmin || currentRound.winning_choice_id > 0 ? currentRound.id : currentRound.id - 1;
        var roundRange = _.range(latestRound, 0, -1);
        async.mapSeries(roundRange, db.getStatsForRound, function(err, results) {
          res.render('stats', {
            title: 'Raygun Lunchtime Stats',
            rounds: results,
            userWins: userWins,
            error: err
          });
        });
      });
    });
  });
});

router.post('/vote', function (req, res) {
  var token = req.body.token.trim().toUpperCase();
  var voteid = +req.body.voteid;

  db.getUserByToken(token, function(err, user){
    if (err || !user) {
      setTimeout(function () {
        res.status(403).send("Bad user, no donut!").end();
      }, 2000);
  
      return;
    }
  
    db.addVote({ choice_id: voteid, user_id: user.id }, function (err) {
      if (err) {
        setTimeout(function () {
          res.status(400).send("You can't vote twice!").end();
        }, 1000);
        return;
      }
      
      // Store the token in the user's cookies for next week
      res.cookie('token', token, { signed: true });
      res.cookie('username', user.name, { signed: true });
      res.redirect('/');
    });
  })
 
});

module.exports = router;