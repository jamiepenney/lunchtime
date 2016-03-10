var express = require('express');
var router = express.Router();
var _ = require('underscore');
var async = require('async');
var db = require('../database');

var config = require('../config.js');

var redis = require("redis"),
redisClient = config.redis ? redis.createClient(config.redis) : redis.createClient();


function renderIndex(res, data){
  res.render('index', {
    title: 'Raygun Lunchtime',
    data: data.choices,
    round: data.currentRound.id,
    winner: data.winner,
    errorOccurred: data.errorOccurred,
    token: data.token,
    user: data.user,
    userHasVoted: data.hasVoted,
    raygunApiKey: config.raygunApiKey
  });
}

router.get('/', function (req, res) {
  var data = {
    errorOccurred: !!req.query.error,
    token: req.signedCookies.token
  };

  db.getUserByToken(data.token, function(err, user){
    data.user = user;
    db.getCurrentRound(function(err, currentRound) {
      data.currentRound = currentRound;
      
      db.hasVotedInRound(user, currentRound.id, function(err, hasVoted){
        data.hasVoted = hasVoted;

        redisClient.get('index:'+currentRound.id, function(err, cached){
          if(cached){
            cached = JSON.parse(cached);
            data.votes = cached.votes;
            data.winner = cached.winner;
            data.choices = cached.choices;

            renderIndex(res, data);
            return;
          } else {
            cached = {};
          }
          db.getVotesByRound(currentRound.id, function(err, votes) {
            cached.votes = data.votes = votes;
            db.getWinner(function(err, winner) {
              cached.winner = data.winner = winner;
              db.getChoicesForRound(currentRound.id, function(err, choices){
                cached.choices = data.choices = choices;

                renderIndex(res, data);

                //redisClient.setex('index:'+currentRound.id, 600, JSON.stringify(cached));
              });
            });
          });
        })

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
            error: err,
            user: user,
            raygunApiKey: config.raygunApiKey
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

    db.getCurrentRound(function(err, currentRound) {
      db.addVote({ choice_id: voteid, user_id: user.id }, function (err) {
        if (err) {
          console.log(err);
          setTimeout(function () {
            res.status(400).send("Something went wrong with your vote!").end();
          }, 1000);
          return;
        }
        // Clear cache
        redisClient.del('index:'+currentRound.id);
        
        // Store the token in the user's cookies for next week
        res.cookie('token', token, { signed: true });
        res.cookie('username', user.name, { signed: true });
        res.redirect('/');
      });
    });
  })

});

module.exports = router;