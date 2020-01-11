const Bundler = require('parcel-bundler');
const rollup = require('rollup');
const execa = require('execa');
const run = require('@rollup/plugin-run');

let bundler, subprocess;

module.exports = async function (term, file) {
  const clear = () => {
    term.clear();
    term.cyan('ᐅ ' + file + '\n\n');
  }
  const run = async (file) => {
    clear();
    try {
      subprocess = execa('node', [ file ]);
      subprocess.stdout.on('data', str => {
        term(str);
      })
      await subprocess;
    } catch (error) {
      clear();
      term.red('\n' + error.message);
    }
  }

  if (subprocess) {
    subprocess.cancel();
  }
  
  clear();

  const inputOptions = {
    input: file
  };
  const outputOptions = {
    file: 'dist/index.js',
    format: 'cjs',
    plugins: [run()]
  };
  const bundle = await rollup.rollup(inputOptions);
  console.log('\n' + Object.keys(bundle));
  const { output } = await bundle.generate(outputOptions);
  console.log('\n' + output);
}

/*
module.exports = function (term, file) {
  const clear = () => {
    term.clear();
    term.cyan('ᐅ ' + file + '\n\n');
  }
  if (subprocess) {
    subprocess.cancel();
  }
  bundler = new Bundler(file, {
    watch: true,
    cache: true,
    target: 'node',
    logLevel: 3
  });
  clear();
  bundler.on('bundled', async (bundle) => {
    clear();
    if (subprocess) {
      subprocess.cancel();
    }
    try {
       subprocess = execa('node', [ bundle.name ]);
       subprocess.stdout.on('data', str => {
         term(str);
       })
       await subprocess;
    } catch (error) {
      clear();
      term.red('\n' + error.message);
    }
  });
  bundler.on('buildError', error => {
    clear();
    term.red('\n' + error.message);
  });
  bundler.bundle();
}

*/