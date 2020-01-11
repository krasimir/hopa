#!/usr/bin/env node

const fs = require('fs') ;
const term = require('terminal-kit').terminal;
const root = process.cwd();

term.fullscreen(true);
term.on('key', function (name, matches, data) {
  if (name === 'CTRL_C' || name === 'CTRL_X') {    
    process.exit();
  } else if (name === 'ESCAPE') {
    showMenu(processFile);
  }
})

function showMenu(cb) {
  const items = fs.readdirSync(root).filter(file => {
    return fs.lstatSync(root + '/' + file).isFile()
  });

  term.clear();
  term.cyan('ᐅ Choose a file:\n');
  term.gridMenu(items , function(error, response) {
    cb(response);
  });
}
function processFile(selection) {
  const file = root + '/' + selection.selectedText;

  term.clear();
  term.cyan('ᐅ ' + file + '\n\n');
  // term.clear()
  setTimeout(function() {
    process.exit();
  }, 30000);
}

showMenu(processFile);

