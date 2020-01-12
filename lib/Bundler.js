const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const execa = require('execa');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('rollup-plugin-babel');

const constants = require('./constants');

const regeneratorRuntimeCode = fs.readFileSync(__dirname + '/vendor/regenerator-runtime.js').toString('utf8');
let watcher, runner;

function createRunner({ term, clear, showKeyControls }) {
  let isDisabled = false;
  let subprocess;
  return {
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

module.exports = async function (term, file) {
  const clear = () => {
    term.clear();
    term.blue('\n  ᐅ ' + path.basename(file) + '\n');
    term.gray('  ----------------------------------\n\n');
  }
  const showKeyControls = () => {
    term.gray('\n\n  ----------------------------------\n');
    term.gray('  ESC (New file) / CTRL+C (Exit)');
  }

  if (runner) {
    runner.disable();
  }
  if (watcher) {
    watcher.close();
  }
  
  clear();

  const options = {
    input: file,
    output: {
      format: 'cjs',
      file: constants.BUNDLE_FILE_NAME
    },
    plugins: [babel({
      "externalHelpers": true,
      "runtimeHelpers": true,
      "presets": [
        [
          "@babel/preset-env",
          {
            "modules": false
          }
        ]
      ],
      "plugins": [
        "@babel/plugin-transform-parameters"
      ]
    }), commonjs()],
    watch: {}
  };
  watcher = rollup.watch(options);
  watcher.on('event', async (event) => {
    if (event.code === 'BUNDLE_END') {
      const result = await event.result.generate({
        format: 'cjs',
        dir: __dirname
      });
      for (const chunkOrAsset of result.output) {
        if (chunkOrAsset.type !== 'asset') {
          const code = regeneratorRuntimeCode + '\n' + chunkOrAsset.code;
          if (runner) {
            runner.disable();
          }
          runner = createRunner({ clear, term, showKeyControls });
          runner.run(code);
        }
      }
    } else if (event.code === 'ERROR' || event.code === 'FATAL') {
      clear();
      term.red('Error:\n\n');
      term('\t' + event.error.message);
      showKeyControls();
    }
  });
  
}