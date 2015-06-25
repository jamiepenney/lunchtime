var request = require('request');
var db = require('./database');
var slack = require('./slack');
var _ = require('underscore');
var config = require('./config');
var choices = require('./choices');

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      bower: {
        options: {
          compress: true
        },
        files: {
          'public/js/vendor/compiled.min.js': 'public/js/vendor/compiled.js'
        }
      }
    },
    bower_concat: {
      all: {
        dest: 'public/js/vendor/compiled.js',
        cssDest: 'public/css/vendor/compiled.css',
      }
    }
  });
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['bower_concat', 'uglify:bower']);
  grunt.registerTask('increment-round', 'Moves to the next round of votes', function () {
    var done = this.async();
    db.incrementCurrentRound(done);
  });
  grunt.registerTask('chooser', 'Chooses the lunch destination for this week', function () {
    var done = this.async();

    db.getVotes(function (votes) {
      if (votes.length === 0) {
        grunt.log.fail("No votes!");
        done();
        return;
      } else {
        var choiceid;
        var choiceMessage;
        // check largest vote for large majority
        var majority = _.chain(votes).countBy(function (v) { return v.vote; }).pairs().max(function (arr) { return arr[1]; }).value();
        // More than 75% majority
        if (majority[1] > (votes.length * 0.75)) {
          choiceid = majority[0];
          choiceMessage = "by >75% majority";
        } else {
          // Otherwise pick randomly
          var index = Math.floor(Math.random() * votes.length);

          choiceid = votes[index].vote;
          choiceMessage = "randomly";
        }
        var choice = _.find(choices.list, function (c) { return c.id == choiceid });

        slack.broadcast("The lunch destination has been chosen " + choiceMessage + ": " + choice.name, function (err) {
          if (err) {
            grunt.log.fail(err);
            done();
          } else {
            db.setWinner(choiceid, function (err) {
              grunt.log.write("The lunch destination has been chosen " + choiceMessage + ": " + choice.name);
              if (err) {
                grunt.log.warn("Couldn't set the winner: " + err);
              }
              done();
            });
          }
        });
      }
    });
  });

  grunt.registerTask('showvotes', 'Shows this week\'s votes', function () {
    var done = this.async();

    db.getVotes(function (votes) {
      if (votes.length === 0) {
        grunt.log.ok("No votes!");
        done();
        return;
      } else {
        grunt.log.ok(votes.length + " votes cast");
        for (var index = 0; index < votes.length; index++) {
          var vote = votes[index];
          var choice = _.find(choices.list, function (c) { return c.id == vote.vote });
          grunt.log.ok(vote.user + " voted for " + choice.name);
        }
        done();
      }
    });
  });

  grunt.registerTask('reminder', 'Sends the lunch reminder to Slack', function () {
    var done = this.async();
    slack.broadcast("Reminder: Vote for your choice for this week's lunch at http://lunch.jamiepenney.co.nz", function (err) {
      if (err) {
        grunt.log.fail(err);
      } else {
        grunt.log.write('Reminder sent');
      }
      done();
    });
  });

  grunt.registerTask('sendToken', 'Sends token and instrctions to a user', function() {
    var done = this.async();
    var user = grunt.option('user');

    if (!user) {
      grunt.log.error('specify a --user');
      return;
    }

    var configUser = _.find(config.users, function(u) { return u.user == user; });
    if (!configUser) {
      grunt.log.error('Couldn\'t find that user');
      return;
    }
    slack.directMessage('Here\s your http://lunch.jamiepenney.co.nz token: `' + configUser.token + '`', configUser.slackUsername, done);
  });
};