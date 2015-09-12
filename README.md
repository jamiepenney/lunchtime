# lunchtime
The Raygun Lunch bot

## Requirements:
* Postgres, running on localhost with the default port
* nodejs
* a config.js file (example provided in the repo)

## Running
`node bin/www` from the `lunchtime/` directory will kick it off on port 8777 by default.

## Configuration - config.js

For the Slack integration to work, you need to set `slackUrl` to a Slack Webhook URL,
and `slackRoom` to a room or channel name with a hash in front of it.

## Choices

The `choice` table has the available choices in it. Each choice is an id
and a name (this is what is displayed to the user). The ids should be unique, and
shouldn't change over time. Add new choices rather than editing or removing old ones.
If you don't want a choice to show up yet or until after a certain round, you can use the
`added_in` and `removed_in` properties to skip those choices. `added_in` is the first round
that a choice should appear in, and `removed_in` is the last one it appeared in.

To add or remove choices, you should run them in a migration script - see the `db-migrations`
folder for examples. 