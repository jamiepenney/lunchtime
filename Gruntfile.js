var request = require('request');
var db = require('./database');
var slack = require('./slack');
var _ = require('underscore');
var config = require('./config');

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

    db.getVotes(function (err, votes) {
      if(err) {
        grunt.log.fail(err);
        done();
        return;
      }
      if (votes.length === 0) {
        grunt.log.fail("No votes!");
        done();
        return;
      } else {
        var choice;
        var choiceMessage;
        var vote_id;
        // check largest vote for large majority
        var majority = _.chain(votes).countBy(function (v) { return v.vote; }).pairs().max(function (arr) { return arr[1]; }).value();
        // More than 60% majority
        if (majority[1] > (votes.length * 3 / 5)) {
          var c = _.find(votes, function(v) { return v.vote == majority[0]; });
          choice = { id: c.vote, name: c.choice_name};
          choiceMessage = "by >2/3rds majority";
        } else {
          // Otherwise pick randomly
          var index = Math.floor(Math.random() * votes.length);

          choice = { id: votes[index].vote, name: votes[index].choice_name};
          vote_id = votes[index].id;
          choiceMessage = "randomly";
        }

        slack.broadcast("The lunch destination has been chosen " + choiceMessage + ": " + choice.name, function (err) {
          if (err) {
            grunt.log.fail(err);
            done();
          } else {
            db.setWinner({vote_id: vote_id, choice_id: choice.id}, function (err) {
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

  grunt.registerTask('reminder', 'Sends the lunch reminder to Slack', function () {
    var done = this.async();
    slack.broadcast("Reminder: Vote for your choice for this week's lunch at http://lunchtime.apps.jamiepenney.co.nz", function (err) {
      if (err) {
        grunt.log.fail(err);
      } else {
        grunt.log.write('Reminder sent');
      }
      done();
    });
  });

  grunt.registerTask('sendToken', 'Sends token and instructions to a user', function() {
    var done = this.async();
    var username = grunt.option('user');

    if (!username) {
      grunt.log.error('specify a --user');
      return;
    }
    
    db.getUserByName(username, function(err, user){
      if (!user) {
        grunt.log.error('Couldn\'t find that user');
        done();
        return;
      }
      slack.directMessage('Here\'s your http://lunchtime.apps.jamiepenney.co.nz token: `' + user.token + '`', user.slack_username, done);
    });
  });
};
