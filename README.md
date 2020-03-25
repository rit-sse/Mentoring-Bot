# Mentoring-Bot
A discord bot for the end of time

## Setup
* Clone the repo to your local computer
* Create a `.env` file. This will store the data the bot needs for execution
  * See the header below for structure to the `.env`
* Ensure both `node.js` and `npm` are installed on your system.
* Run `npm install` to install all of the proper packages for the bot
* Reach out to the current tech head to be added to the test channel for the
  bot

## .Env File
This file is used to hold all of the important information in regards to the
bot id and channel ids for execution. Currently there are 4 values that need
to be defined:
* BOT_TOKEN -> The identification token of the bot. Discuss with the current
  tech head for information on what the test bot's id is. NEVER share the bot
  token to anyone you don't trust
* BOT_ID -> The identification number of the bot. If setup properly,
  this value can be obtained by right clicking on the channel and selecting
  `COPY ID`
* ANNOUNCEMENT_ID -> The id of the announcement channel. This can also be
  obtained in the same way as the BOT_ID
* VOICE_PARENT_ID -> The id of the voice/text category for mentees (where all
  of these channels will be created). This can also be obtained in the same
  way as the BOT_ID

All `.env` files use the pattern `key=value` and are separated by newlines.
So the above outline should look like the following display:
```
BOT_TOKEN=[insert token here & remove brackets]
BOT_ID=[insert id here & remove brackets]
ANNOUNCEMENT_ID=[insert id here & remove brackets]
VOICE_PARENT_ID=[insert id here & remove brackets]
```

## Execution
Run `npm start` and the bot should come online if it isn't already. Any changes
made to the bot will take place after every successful restart and any
`console.log()` will print to the terminal you're running the bot in
