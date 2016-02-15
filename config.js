var config = {
  slackUrl: process.env.SLACK_URL || 'https://hooks.slack.com/services/THISISNOTAREALSLACKWEBHOOKURL',
  slackRoom: process.env.SLACK_ROOM || '#testing',
  raygunApiKey: process.env.RAYGUN_API_KEY || '',
  pg: process.env.DATABASE_URL || 'postgres://lunchtime:Password1@127.0.0.1:5432/lunchtime',
  appUrl: process.env.APP_URL || 'https://lunchtime.apps.jamiepenney.co.nz'
};

module.exports = config;