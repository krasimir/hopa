#!/usr/bin/env node

const path = require('path');
const fs = require('fs') ;
const term = require('terminal-kit').terminal;
const Bundler = require('./Bundler');
const root = process.cwd();
const cleanup = require('./cleanup');
const cliArgs = require('yargs').argv
let bundler;

// bundling right away
if (cliArgs.i) {
  const inputFile = path.normalize(root + '/' + cliArgs.i);
  const outputFile = cliArgs.o ?
    path.normalize(root + '/' + cliArgs.o) :
    path.normalize(root + '/' + 'bundle.' + path.basename(cliArgs.i));

  if (fs.existsSync(inputFile)) {
    Bundler.once(inputFile, outputFile, term, !!cliArgs.m);
  } else {
    term.red('ᐅ file ' + inputFile + ' not found.\n');
    process.exit();
  }

// watching experience
} else {
  cleanup(root, term);

  term.hideCursor()
  term.fullscreen(true);
  term.on('key', function (name, matches, data) {
    if (name === 'CTRL_C' || name === 'CTRL_X') {    
      process.exit();
    } else if (name === 'ESCAPE') {
      showMenu(processFile);
    }
  })

  function showMenu(cb) {
    if (bundler) {
      bundler.cleanup();
    }
    const items = fs.readdirSync(root).filter(file => {
      return fs.lstatSync(root + '/' + file).isFile()
    });

    items.push('\n   Exit Hopa')

    term.clear();
    term.blue('\n  ᐅ Choose a file:\n');
    term.singleColumnMenu(
      items.map(str => '  ' + (str.match(/Exit/) ? str : './' + str) + '  '),
      {
        selectedStyle: term.dim.blue
      },
      function(error, response) {
        if (response.selectedIndex === items.length-1) {
          term.clear();
          process.exit();
        } else {
          cb(items[response.selectedIndex]);
        }
      });
  }
  function processFile(file) {
    bundler = Bundler(term, root + '/' + file);
  }

  showMenu(processFile);
}

