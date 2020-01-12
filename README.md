![Хопа-тропа](./assets/hopa-tropa.jpg)

<h3 align="center">Zero config JavaScript/TypeScript runner right in your terminal</h3>

---

## Features

* 0 configuration
* Transpiles JavaScript and TypeScript
* Little single-folder file browser

## What and Why

**Hopa** is a command line tool that does the following:

* Reads the current directory and lets you choose a file.
* Transpiles the file and produces a valid JavaScript bundle.
* Runs the generated bundle via node and shows you the result.
* It also runs a watcher so changing the files will trigger a new compilation.

I did this little tool because I'm tired of creating dummy repos, copying webpack files, switching between terminal and browser just so I can run some "modern" JavaScript. I know about solution like [CodeSandbox](https://codesandbox.io/) and [CodePen](https://codepen.io/) but I want specifically to exercise my code in the terminal. And I want to do it quick, without configuring stuff like Babel and Webpack.

## Installation

```
npm i hopa -g
```

## Usage

Go to the folder that contains your files and run `hopa`.

```
> hopa
```

## Demo

![Hopa demo](./assets/hopa.gif)