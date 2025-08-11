# Developing

## Setting up development environment

You will start by
[forking](https://github.com/GEOLYTIX/xyz/fork) the XYZ repository.

### Development dependencies

The minimum requirements are:

- Git
- [Node.js](https://nodejs.org/) (version 18 and above)

The executables `git` and `node` should be in your `PATH`.

To install the Node.js dependencies run

    pnpm install

Please check the full list of dependencies as defined in the [package.json](https://github.com/GEOLYTIX/xyz/blob/main/package.json)

## ESBuild

The MAPP and MAPP.UI library must be build with [esbuild](https://esbuild.github.io/) prior to launching the host.

    pnpm exec esbuild ./lib/mapp.mjs ./lib/ui.mjs --bundle --minify --tree-shaking=false --sourcemap --format=iife --outdir=./public/js

The build command is stored in the package.json as `_build` script.

    pnpm _build

ESBuild must also be used to compile the CSS supporting the MAPP and MAPP.UI elements.

    pnpm exec esbuild --bundle public/css/_mapp.css --outfile=public/css/mapp.css

    pnpm exec esbuild --bundle public/css/_ui.css --outfile=public/css/ui.css --loader:.svg=dataurl

## Hot rebuild with nodemon & VSCode Chrome Debugger

### nodemon

The development environment uses nodemon to watch for changes and automatically rebuild the necessary files. This is configured in `nodemon.json`:

```json
{
  "watch": ["lib/**/*", "tests/**/*", "public/css/*", "../xyz_resources/**/*"],
  "ext": ".js,.mjs,.json,.css,.svg",
  "ignore": ["public/js/**/*", "public/css/mapp.css", "public/css/ui.css"],
  "env": {
    "NODE_ENV": "DEVELOPMENT"
  },
  "exec": "pnpm exec concurrently \"node esbuild.config.mjs\" \"pnpm ui_css\" \"pnpm mapp_css\"",
  "events": {
    "start": "echo \"Watching for changes...\"",
    "exit": "echo \"Build complete\""
  }
}
```

#### Watched Directories

- `lib/**/*`: All files in the lib directory
- `tests/**/*`: All test files
- `public/css/*`: CSS source files
- `../xyz_resources/**/*`: External resource files.

#### File Types Watched

- JavaScript files (`.js`)
- ES Modules (`.mjs`)
- JSON files (`.json`)
- CSS files (`.css`)
- SVG files (`.svg`)

#### Ignored Files

- Built JavaScript files (`public/js/**/*`)

- Compiled CSS files:
  - `public/css/mapp.css`
  - `public/css/ui.css`

#### Automatic Actions

When changes are detected:

1. Rebuilds JavaScript using esbuild
2. Recompiles UI CSS
3. Recompiles MAPP CSS
4. All tasks run concurrently for faster builds

### Running nodemon

1. Start the watch mode:

```bash
  pnpm exec nodemon
```

2. Nodemon will:
   - Set `NODE_ENV` to "DEVELOPMENT"
   - Watch for file changes
   - Automatically rebuild affected files
   - Display "Watching for changes..." when started
   - Show "Build complete" after each rebuild

3. The application will rebuild automatically when you:
   - Modify test files
   - Change source code
   - Update CSS
   - Modify resources

This ensures that your test environment always has the latest changes without manual rebuilds.

### VSCode Tasks & Launch

A task can be added to the `.vscode/tasks.json` to execute `nodemon`. This will allow VSCode to rebuild the application on script changes in the editor.
Along side this there is an optional `kill-watch` task that is used to tear down the `start-watch` process once finished with debugging.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "start-watch",
      "type": "shell",
      "command": "pnpm exec nodemon",
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
      "command": "pkill -f nodemon"
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
  "postDebugTask": "kill-watch",
  "env": {}
}
```

#### VSCode / Chrome Debugging

An additional debug configuration in `.vscode/launch.json` is required to debug the mapp lib code in VSCode.

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug in Chrome",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}/xyz/lib", //Please check your worksapceFolder
  "sourceMaps": true,
  "pauseForSourceMap": true
}
```

The Chrome debug config must be launched as an additional session. VSCode run and debug panel will show 2 active sessions. A chrome instance should open with the url defined in the Chrome debug config.

Breakpoints set in the mapp lib script will now be respected in the VSCode debug editor window. Breakpoints set in the Chrome dev tools will also break in the VSCode editor.

#### CLI Test Debugging

You can also debug the codi tests with the following launch config.

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "skipFiles": ["<node_internals>/**"],
  "program": "${workspaceFolder}/node_modules/codi-test-framework/cli.js",
  "args": ["${workspaceFolder}/tests", "--quiet"],
  "runtimeArgs": ["--watch-path=.", "--experimental-test-module-mocks"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "cwd": "${workspaceFolder}"
}
```

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

## Biome

The codebase uses [Biome](https://biomejs.dev/) to ensure code quality, consistent formatting, and adherence to coding guidelines. Biome is an all-in-one tool for linting, formatting, and more.

To run Biome, you need to have the development dependencies installed. Make sure to run `pnpm install` in the root of the xyz directory.

To check for linting and formatting issues, run the following command in the root of the application:

    pnpm exec biome check

To automatically fix issues (where possible), run:

    pnpm exec biome check --write

You can also use Biome's formatting capabilities:

    pnpm exec biome format

Or to format and apply fixes:

    pnpm exec biome format --write

Many editors have Biome extensions or plugins for on-the-fly error highlighting and formatting. Please refer to the [Biome editor integration guide](https://biomejs.dev/docs/integrations/editors/) for setup instructions for your environment.

## version.js hash

The mapp module object holds a hash of the latest release commit which can be generated by executing the version.js script in the root.

The version script will complete by executing the ESBuild process.

    node version.js

## Express

[Express.js](https://expressjs.com/) will be installed by npm as a development dependency. You can run a zero config instance by loading the express.js script in your node runtime.

    node express.js

The default port is 3000. You can access the mapp interface on <http://localhost:3000/> in your browser.

Please refer to the [Getting Started](https://github.com/GEOLYTIX/xyz/wiki/Getting-started) wiki page for the next steps in regards to workspace configuration and environment variables.
