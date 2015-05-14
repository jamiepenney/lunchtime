# lunchtime
The Raygun Lunch bot

## Requirements:
* Redis, running on localhost with the default port
* nodejs
* a config.js file (example provided in the repo)

## Running
`node bin/www` from the `lunchtime/` directory will kick it off on port 8777 by default.

## Configuration - config.js

For the Slack integration to work, you need to set `slackUrl` to a Slack Webhook URL,
and `slackRoom` to a room or channel name with a hash in front of it.

The `users` array has your users and their tokens - each entry in the array should be
an object with a `user` and `token` property, set to strings. The tokens need to be
unique - you can't give two users the same token.

## Choices - choices.js

This file has the available choices in it. Each choice is an object with an id property,
and a name (this is what is displayed to the user). The ids should be unique, and
shouldn't change over time. Add new choices rather than editing or removing old ones.
If you don't want a choice to show up yet or until after a certain round, you can use the
`addedIn` and `removedIn` properties to skip those choices. `addedIn` is the first round
that a choice should appear in, and `removedIn` is the last one it appeared in.
