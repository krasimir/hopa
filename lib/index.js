#!/usr/bin/env node

const fs = require('fs') ;
const term = require('terminal-kit').terminal;
const Bundler = require('./Bundler');
const root = process.cwd();
const cleanup = require('./cleanup');
let bundler;

cleanup(root, term);

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

  term.clear();
  term.blue('\n  ᐅ Choose a file:\n');
  term.singleColumnMenu(
    items.map(str => '  ' + str + '  '),
    {
      selectedStyle: term.dim.blue
    },
    function(error, response) {
      cb(items[response.selectedIndex]);
    });
}
function processFile(file) {
  bundler = Bundler(term, root + '/' + file);
}

showMenu(processFile);

