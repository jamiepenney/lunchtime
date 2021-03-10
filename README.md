# lunchtime
The Lunch choosing bot

## Requirements:
* Postgres 9.5 or later, running on localhost with the default port
* nodejs
* a config.js file (example provided in the repo)

## Running
`node bin/www` from the `lunchtime/` directory will kick it off on port 8777 by default.

Run `grunt increment-round` to create a new voting round.

Run `grunt reminder` to tell Slack to remind people to vote for lunch.

## Configuration - config.js

For the Slack integration to work, you need to set `slackUrl` to a Slack Webhook URL,
and `slackRoom` to a room or channel name with a hash in front of it.

Alternatively you can set everything in config.js from the environment variables:

* `PORT` should be the port the application is listening on.
* `SLACK_URL` should be the Slack integration URL for posting messages into Slack.
* `SLACK_ROOM` is the Slack room we post messages to. Include the \# at the start of it.
* `RAYGUN_API_KEY` is your Raygun API key if you want errors sent to Raygun.
* `DATABASE_URL`is your Postgres database connection string.
* `APP_URL` is the url where this app is deployed.

## Choosing a winner

Run `grunt chooser` to select a winner from the current votes. The code for this is in `Gruntfile.js`.

## Choices

The `choice` table has the available choices in it. Each choice is an id
and a name (this is what is displayed to the user). The ids should be unique, and
shouldn't change over time. Add new choices rather than editing or removing old ones.
If you don't want a choice to show up yet or until after a certain round, you can use the
`added_in` and `removed_in` properties to skip those choices. `added_in` is the first round
that a choice should appear in, and `removed_in` is the last one it appeared in.

To add or remove choices, you should run them in a migration script - see the `db-migrations`
folder for examples. 
