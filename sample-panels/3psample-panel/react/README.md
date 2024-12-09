# third-party-plugin-template

A panel used to prototype the third party plugin using third party api.

Scroll to bottom for status updates on plugin development

Use the following command to load this plugin in premiere pro via DVA console.

```
uxphost.load extension=com.adobe.dva.thirdparty hostview=panel
```

## Basic JS Dev Setup

### Mac

Download the node installer from `https://nodejs.org/en/download/` and choose the current stable version.
Install `yarn` via `npm install --global yarn` and also run `npm install npx -g -f`
The IDE of choice for react + js development is [VSCode](https://code.visualstudio.com/) (+ extensions for JS and React development)

### Windows

- Install node.js from https://nodejs.org/en/download/
- Install yarn from https://classic.yarnpkg.com/en/docs/install/#windows-stable

# VSCode other settings

If you see warnings in standard JS files like `'import' is only available in ES6 (use 'esversion: 6'). (W119)jshint(W119)` and VSCode labels the JS files as `Babel Javascript`, then you can change the default mapping of JS files to be Typescript.
See https://stackoverflow.com/questions/49362018/typescript-on-js-file-with-vscode

# Frameworks used in this project

- React [Homepage](https://reactjs.org/)
- Redux (for state management and event propagation) [Homepage](https://redux.js.org/)
- Redux Observable (async state operations) [Homepage](https://redux-observable.js.org/)\
- Jest (as testing framework) [Homepage](https://jestjs.io/)

## Release process

For extensions hosted in dva/dva-js the release process to artifactory is fully automated. After every merged PR changes are deployed to a versioned package of that extension using the commit-id as postfix.

For extensions hosted outside of dva, the release should follow these steps:

- in your extension run: "export CI=true" (on mac or $env:CI=true on windows)
- yarn install
- yarn run build
- rm /build/debug.json

At this point the content of the "build" folder is ready to deployment to your application (or you can zip it and store it on artifactory). Applications should pick up every extension placed in their /UXP/plugins folder. Also make sure your plugin names are unique (folder name and name used in the /public/manifest.json)

## Available Scripts

### `yarn run start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `yarn run watch`

Re-build the app on every code change. This will update the /build folder on the fly (similar to yarn run start but without spawning a web server)

### `yarn run hot`

Re-build the app on every code change. This will update the /build folder on the fly (similar to yarn run start but without spawning a web server - emits code that is ready for use with hot reloading - e.g. starting both the hot and start scripts)

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### `yarn run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

## Status Updates on Plugin Development

2/16/2024
The third-party-plugin-template has 5 function buttons. The code is housed in src/footer.tsx

- Open Project
- Create Project
- Add Media
- Create Sequence - creates a sequence from the first clip it finds, and names the sequence as such, concurrent with the Premiere Pro UI.
- Add Transition - inserts a default transition at the end of the first clip of the current sequence.

The last three are conditional, and will log the message "no project found" if a project is not open.

Documentation on currently exposed API objects is located here: link
