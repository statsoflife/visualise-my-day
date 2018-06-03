# Visualise My Day

A quick prototype for visualising all data for a specific day. Utilised for presentations.

## How to use

1. Hook up your data to be pulled by the app. The easiest way is to add to symlink to a `data` directory within the `public` directory. Please see the `App.js` file for the paths required for each type of data.
2. Start up the server - this is using the `create-react-app` setup, so `npm start` will kick this off in development mode.
3. You should now be able to see a interface with data showing, and be able to move backwards and forwards through days.

*Note:* In order to display Google timeline KML data on the Google Map, the KML files must be publically available for Google servers to access. The easiest way to do this is to use [`ngrok`](https://ngrok.com/). Once you have ngrok running and pointing to the development server, please add the ngrok URL in `App.js` as the `server` value.

## Upcoming

The aim of this UI was initially as a presentation tool, and now as a jumping off point for further development. I don't have a clear roadmap for this work, but hope to enhance it as further extractors are created, and build upon it to make it easier to use.
