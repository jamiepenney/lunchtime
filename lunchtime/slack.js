var request = require('request');
var config = require('./config');

var sendToSlack = function (message, next) {
  var data = {
    'username': 'lunch-bot',
    'text': message,
    'icon_emoji': ':meat_on_bone:'
  };
  
  request({
    method: 'POST',
    uri: config.slackUrl,
    body: data,
    json: true
  }, function (error, response, body) {
    if (response.statusCode < 300) {
      next();
    } else {
      next("couldn't send to Slack: " + body);
    }
  });
}

module.exports = {
  send: sendToSlack
};