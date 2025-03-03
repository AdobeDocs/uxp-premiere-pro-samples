# How to Integrate with OAuth

This tutorial will show you how to implement the OAuth workflow in a Premiere Pro UXP Plugin, using the Dropbox API as an example (current as of 26 Feb 2025).

> [!NOTE]
> Auth workflows are necessarily complex, so this tutorial will be on the longer side and make use of some advanced concepts. Please read each section carefully, especially the Prerequisites and Configuration sections.

## Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript.
- Familiarity with your OS's command line application
- Familiarity with [OAuth](https://oauth.net/2/)
- [A registered app on Dropbox](https://www.dropbox.com/developers/apps/create) with the following settings:

  1.  Chose "Scoped Access" for the API
      -  Ensure that you enable the **account_info.read** scope after the app is created
  1.  Choose "Full Dropbox" for the access type

## Technology Used

1. *[Install required]* [Node.js](https://nodejs.org/en/) and the [`npm` package manager](https://www.npmjs.com)
1. [OAuth](https://oauth.net/2/)
1. [Dropbox API](https://www.dropbox.com/developers/documentation/http/overview)

## Overview of the OAuth workflow

There are three parts of this workflow:

- Your Premiere Pro UXP Plugin
- Your server endpoints (for this development example, we'll create a local Node.js server)
- The service providers OAuth endpoints (for this example, the Dropbox API)

The high-level workflow is as follows:
*(note that below, **server** refers to the local Node.js server, and **service** refers to Dropbox)*

1. The Premiere Pro UXP Plugin pings the server to get the session ID
1. The server returns a unique ID for the user's Premiere Pro session
1. The Premiere Pro UXP Plugin opens a tab in user's default browser with a URL pointing to an endpoint on the server
    - The user, via the web browser, authorizes both the server and the service to communicate
1. The server/service handshake handles the entire OAuth code grant workflow
1. The server saves the access token paired with the session ID
1. The Premiere Pro UXP Plugin asks the server if an access token has been defined for the session ID. If the token is available, the server sends the access token back
1. The Premiere Pro UXP Plugin uses the access token to make service API calls through the server

## Configuration

The following steps will help you get the sample code from our GitHub repo up and running.

### 1. Install Node.js packages

Inside the sample repo's `server` folder, there is a `package.json` file that contains a list of dependencies. Run the following command from the top level directory of the repo to install the dependencies:

```bash
$ cd server
$ npm install
```

### 2. Set your API credentials and public URL

Enter the required credentials in `public/config.js`. You'll need:

- Your Dropbox API key
- Your Dropbox API secret
- Your local Node.js server address (assumed to be **http://localhost:8000** in this sample)

> [!IMPORTANT]
> In addition to your Dropbox API key and secret, your Dropbox application should be configured camera

with the following *Redirect URI* for your local server:
>
> **http://localhost:8000/callback**


```js
const dropboxApiKey = "YOUR-DROPBOX-API-KEY";
const dropboxApiSecret = "YOUR-DROPBOX-SECRET";
const publicUrl = "http://localhost:8000";

try {
  if (module) {
    module.exports = {
      dropboxApiKey: dropboxApiKey,
      dropboxApiSecret: dropboxApiSecret,
      publicUrl: publicUrl,
    };
  }
} catch (err) {
  console.log(err);
}
```

Our server will make use of these settings in a later step.

### 3. Start the server

After completing the configuration steps, start the server from the `server` directory:

```
$ npm start
```

Now you have a running server with an HTTPS endpoint and your Dropbox credentials ready to go.

### 4. Running the plugin

Using the *Adobe UXP Developer Tools* application, add *oauth-workflow-sample/manifest.json* and then load the listed plugin to launch it in Premiere Pro. Once loaded, click on **Connect OAuth** in Premiere Pro to start the OAuth authentication process.
