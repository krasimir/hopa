const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('rollup-plugin-babel');
const typescript = require('@rollup/plugin-typescript');
const execa = require('execa');
const UglifyJS = require("uglify-js");

const constants = require('./constants');

const regeneratorRuntimeCode = fs.readFileSync(__dirname + '/vendor/regenerator-runtime.js').toString('utf8');
let watcher, runner;

function createRunner({ term, clear, showKeyControls }) {
  let isDisabled = false;
  let subprocess;
  return {
    isDisabled() {
      return isDisabled;
    },
    disable() {
      isDisabled = true;
      if (subprocess) {
        subprocess.cancel();
      }
    },
    async run(code) {
      if (isDisabled) return;
      clear();
      let result = '';
      try {
        subprocess = execa('node', [ '-e', code ]);
        subprocess.stdout.on('data', str => {
          result += '  ' + str;
          if (!isDisabled) {
            clear();
            term(result);
            showKeyControls();
          }
        });
        subprocess.stdout.on('end', () => {
          if (!isDisabled) {
            clear();
            term(result);
            showKeyControls();
          }
        });
        await subprocess;
      } catch (error) {
        if (!isDisabled) {
          clear();
          term.red('\n', error);
          showKeyControls();
        }
      }
    }
  }
}

function createWatcher(file, outputFile, tmpFile = '') {
  const options = {
    input: file,
    output: {
      format: 'cjs',
      file: outputFile
    },
    plugins: [babel({
      "extends": __dirname + '/../.babelrc',
      "babelrcRoots": [
        __dirname + '../'
      ]
    }), commonjs(), typescript()],
    watch: {
      exclude: tmpFile,
      chokidar: false
    }
  };
  return rollup.watch(options);
}

function Bundler(term, file) {
  const tmpFile = path.dirname(file) + '/' + constants.BUNDLE_FILE_NAME;
  const clear = () => {
    term.clear();
    term.gray('\n  ᐅ ' + path.basename(file) + '\n');
    term.gray('  ----------------------------------\n\n');
  }
  const showKeyControls = () => {
    term.gray('\n\n  ----------------------------------\n');
    term.gray('  ESC (New file) / CTRL+C (Exit)');
  }
  let sourceCode = '';

  if (runner) {
    runner.disable();
  }
  if (watcher) {
    watcher.close();
  }
  
  clear();

  watcher = createWatcher(file, constants.BUNDLE_FILE_NAME, tmpFile);
  watcher.on('event', async (event) => {
    if (event.code === 'BUNDLE_END') {
      const result = await event.result.generate({
        format: 'cjs',
        dir: __dirname
      });
      const { code: chunkOrAssetCode } = result.output[0];
      const code = regeneratorRuntimeCode + '\n' + chunkOrAssetCode;
      if (sourceCode === chunkOrAssetCode) return;
      sourceCode = chunkOrAssetCode;
      if (runner) {
        runner.disable();
      }
      runner = createRunner({ clear, term, showKeyControls });
      runner.run(code);
    } else if (event.code === 'ERROR' || event.code === 'FATAL') {
      if (runner) {
        runner.disable();
      }
      clear();
      term.red('Error:\n\n');
      term('\t' + event.error.message);
      showKeyControls();
      sourceCode = '';
    }
  });

  return {
    cleanup() {
      sourceCode = '';
      if (runner) {
        runner.disable();
      }
      if (watcher) {
        watcher.close();
      }
      
      if (fs.existsSync(tmpFile)) {
        try {
          fs.unlinkSync(tmpFile)
        } catch(err) {
          term.gray('  Hopa cleaning failed. There is probably ' + bundleFilePath + ' left on your disk.\n');
        }
      }
    }
  }  
}

Bundler.once = function (file, outputFile, term, minify) {
  watcher = createWatcher(file, outputFile);
  watcher.on('event', async (event) => {
    if (event.code === 'BUNDLE_END') {
      const result = await event.result.generate({
        format: 'cjs',
        dir: __dirname
      });
      const { code } = result.output[0];
      let bundle = code.match(/regeneratorRuntime/g) ? regeneratorRuntimeCode + '\n' + code : code;
      if (minify) {
        const minified = UglifyJS.minify(bundle, {
          compress: { unused: true, dead_code: true }
        });
        bundle = minified.code;
      }
      fs.writeFileSync(outputFile, bundle);
      term.gray('\n  Hopa:');
      term.blue('\n  ᐅ ' + path.basename(outputFile) + ' file created' + (minify ? ' (minified)' : '') +'\n');
      term('\n');
      watcher.close();
    } else if (event.code === 'ERROR' || event.code === 'FATAL') {
      term.red('ᐅ Error:\n\n');
      term('\t' + event.error.message);
    }
  });
}

module.exports = Bundler;