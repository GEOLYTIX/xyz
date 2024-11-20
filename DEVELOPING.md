# Developing

## Setting up development environment

You will start by
[forking](https://github.com/GEOLYTIX/xyz/fork) the XYZ repository.

### Development dependencies

The minimum requirements are:

* Git
* [Node.js](https://nodejs.org/) (version 18 and above)

The executables `git` and `node` should be in your `PATH`.

To install the Node.js dependencies run

    npm install

Please check the full list of dependencies as defined in the [package.json](https://github.com/GEOLYTIX/xyz/blob/main/package.json)

## ESBuild

The MAPP and MAPP.UI library must be build with [esbuild](https://esbuild.github.io/) prior to launching the host.

    npx esbuild ./lib/mapp.mjs ./lib/ui.mjs --bundle --minify --tree-shaking=false --sourcemap --format=iife --outdir=./public/js

The build command is stored in the package.json as `_build` script.

    npm run _build

ESBuild must also be used to compile the CSS supporting the MAPP and MAPP.UI elements.

    npx esbuild --bundle public/css/_mapp.css --outfile=public/css/mapp.css

    npx esbuild --bundle public/css/_ui.css --outfile=public/css/ui.css --loader:.svg=dataurl

## Hot rebuild with nodemon & VSCode Chrome Debugger

### nodemon

The development environment uses nodemon to watch for changes and automatically rebuild the necessary files. This is configured in `nodemon.json`:

```json
{
    "watch": [
        "lib/**/*",
        "tests/**/*",
        "public/css/*",
        "../xyz_resources/**/*"
    ],
    "ext": ".js,.mjs,.json,.css,.svg",
    "ignore": [
        "public/js/**/*",
        "public/css/mapp.css",
        "public/css/ui.css"
    ],
    "env": {
        "NODE_ENV": "DEVELOPMENT"
    },
    "exec": "npx concurrently \"node esbuild.config.mjs\" \"npm run ui_css\" \"npm run mapp_css\"",
    "events": {
        "start": "echo \"Watching for changes...\"",
        "exit": "echo \"Build complete\""
    }
}
```

#### Watched Directories

* `lib/**/*`: All files in the lib directory
* `tests/**/*`: All test files
* `public/css/*`: CSS source files
* `../xyz_resources/**/*`: External resource files.

#### File Types Watched

* JavaScript files (`.js`)
* ES Modules (`.mjs`)
* JSON files (`.json`)
* CSS files (`.css`)
* SVG files (`.svg`)

#### Ignored Files

* Built JavaScript files (`public/js/**/*`)

* Compiled CSS files:
  * `public/css/mapp.css`
  * `public/css/ui.css`

#### Automatic Actions

When changes are detected:

1. Rebuilds JavaScript using esbuild
2. Recompiles UI CSS
3. Recompiles MAPP CSS
4. All tasks run concurrently for faster builds

### Running nodemon

1. Start the watch mode:

```bash
  npx nodemon
```

2. Nodemon will:
   * Set `NODE_ENV` to "DEVELOPMENT"
   * Watch for file changes
   * Automatically rebuild affected files
   * Display "Watching for changes..." when started
   * Show "Build complete" after each rebuild

3. The application will rebuild automatically when you:
   * Modify test files
   * Change source code
   * Update CSS
   * Modify resources

This ensures that your test environment always has the latest changes without manual rebuilds.

### VSCode Tasks & Launch

A task can be added to the `.vscode/tasks.json` to execute `nodemon` and `browser-sync` concurrently. This will allow VSCode to rebuild the application on script changes in the editor.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "start-watch",
      "type": "shell",
      "command": "npx concurrently 'npx nodemon' 'npm run browser-sync'",
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "^.*$"
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "Watching for changes...",
          "endsPattern": "Build complete"
        }
      }
    },
    {
        "label": "kill-watch",
        "type": "shell",
        "command": "pkill -f nodemon; pkill -f browser-sync"
    }
  ]
}
```

`start-watch` (preLaunchTask) and `kill-watch` (postDebugTask) must be added to your debug configuration in `.vscode/launch.json` to ensure the watch process starts before debugging and stops after each debugging session.

```json
{
  "type": "node",
  "request": "launch",
  "name": "Launch Server",
  "program": "${workspaceFolder}/express.js",
  "preLaunchTask": "start-watch",
  "console": "integratedTerminal",
  "internalConsoleOptions": "openOnSessionStart",
  "postDebugTest": "kill-background",
  "env": {}
}
```

The `browser-sync` script is defined in the `package.json` as `"npx browser-sync start --proxy localhost:3000 --port 3001 --ui-port 3002 --files public/js/**/* --no-open --no-notify"`

The application running on port 3000 will be proxied to port 3001 for the browser-sync event. The browser window will refresh when the node application rebuilds after changes to the script in a VSCode editor.

#### VSCode / Chrome Debugging

An additional debug configuration in `.vscode/launch.json` is required to debug the mapp lib code in VSCode.

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug in Chrome",
  "url": "http://localhost:3001",
  "webRoot": "${workspaceFolder}/xyz/lib", //Please check your worksapceFolder
  "sourceMaps": true,
  "pauseForSourceMap": true
}
```

The Chrome debug config must be launched as an additional session. VSCode run and debug panel will show 2 active sessions. A chrome instance should open with the url defined in the Chrome debug config.

Breakpoints set in the mapp lib script will now be respected in the VSCode debug editor window. Breakpoints set in the Chrome dev tools will also break in the VSCode editor.

The browser will automatically reload on changes to files in the `lib`, 'tests' and `public/css' directories.

#### Additional settings for VSCode

Here are some additional settings to use in your ./vscode/settings.json file

```json
{
  // Enables debugging when clicking links in the terminal or debug console
  "debug.javascript.debugByLinkOptions": "always",

  // Automatically opens the debug view when a breakpoint is hit
  "debug.openDebug": "openOnDebugBreak",

  // Shows variable values directly in the editor while debugging
  "debug.inlineValues": "on",

  // Always shows the debug status (running/stopped) in the status bar
  "debug.showInStatusBar": "always",

  // Keeps the debug toolbar fixed at the top of the editor
  "debug.toolBarLocation": "docked",

  // Shows breakpoint markers in the scroll bar for easy navigation
  "debug.showBreakpointsInOverviewRuler": true,

  // Shows dots in the editor gutter where breakpoints can be placed
  "debug.showInlineBreakpointCandidates": true,

  // Pauses execution if there's an error in a conditional breakpoint
  "debug.javascript.breakOnConditionalError": true
}
```

## ESLint

The codebase makes use of the [eslint](eslint.org) package to ensure that our code adhere to different rules and coding guidelines.
To run `eslint` you will need to have the development packages installed. You can ensure they are installed by running `npm install` in the root of the xyz directory.

To run the lint you can execute `npx eslint .` in the root of the application. This will show any issues there are with the codebase. You can also add the flag `--fix` to the command to allow eslint to fix any issues it may find.

eslint command

    npx esbuild .

eslint command with fix

    npx esbuild . --fix

There are other extensions you can use in your editor to get on the fly error highlighting where any rules are broken. Please look into what eslint supports in your environment.

## version.js hash

The mapp module object holds a hash of the latest release commit which can be generated by executing the version.js script in the root.

The version script will complete by executing the ESBuild process.

    node version.js

## Express

[Express.js](https://expressjs.com/) will be installed by npm as a development dependency. You can run a zero config instance by loading the express.js script in your node runtime.

    node express.js

The default port is 3000. You can access the mapp interface on <http://localhost:3000/> in your browser.

Please refer to the [Getting Started](https://github.com/GEOLYTIX/xyz/wiki/Getting-started) wiki page for the next steps in regards to workspace configuration and environment variables.
