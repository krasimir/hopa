const a = require('./test2.js');

console.log(a({ name: 'Hopa' }));

function * test() {
  yield 'foo';
}

const t = test();
console.log(t.next());
let counter = 0;

setInterval(() => {
  if (++counter < 40) {
    console.log('fa');
  }
}, 100);