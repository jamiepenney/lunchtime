module.exports = {
  slackUrl: 'https://hooks.slack.com/services/THISISNOTAREALSLACKWEBHOOKURL',
  slackRoom: '#testing',
  users: [
    { user: 'Alex', token: 'AAAA' },
    { user: 'Jamie', token: 'BBBB' },
  ],
  raygunApiKey: 'THISISNTAREALKEY',
  pg: {
    user: 'lunchtime',
    password: 'Password1',
    database: 'lunchtime',
    host: '127.0.0.1'
  }
};