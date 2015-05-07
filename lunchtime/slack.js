var request = require('request');
var config = require('./config');


var send = function (message, channel, next) {
  var data = {
    'username': 'lunch-bot',
    'text': message,
    'icon_emoji': ':meat_on_bone:',
  };
  
  if (channel) {
    data.channel = channel;
  }
  
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


var broadcast = function (message, next) {
  send(message, config.slackRoom, next);
}

var directMessage = function (message, user, next) {
  request({
    method: 'POST',
    uri: 'https://slack.com/api/im.open',
    body: data,
    json: true
  }, function (error, response, body) {
    if (response.statusCode < 300) {
      next();
    } else {
      next("couldn't send to Slack: " + body);
    }
  });

  send(message, '@' + user, next);
}

module.exports = {
  broadcast: broadcast,
  directMessage: directMessage
};