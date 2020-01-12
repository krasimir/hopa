const fs = require('fs');

const constants = require('./constants');

module.exports = function (root, term) {
  function exitHandler(options, exitCode) {
    // if (options.cleanup) console.log('clean');
    // if (exitCode || exitCode === 0) console.log(exitCode);
    // if (options.exit) process.exit();
    
    const bundleFilePath = root + '/' + constants.BUNDLE_FILE_NAME;

    if (fs.existsSync(bundleFilePath)) {
      term.gray('\n\n  Hopa exiting. Cleaning up.\n');
      try {
        fs.unlinkSync(bundleFilePath)
        //file removed
      } catch(err) {
        term.gray('  Hopa cleaning failed. There is probably ' + bundleFilePath + ' left on your disk.\n');
      }
    }
  }
  
  // do something when app is closing
  process.on('exit', exitHandler.bind(null,{ cleanup: true }));
  
  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true}));
  
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true}));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true}));
  
  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true}));
}