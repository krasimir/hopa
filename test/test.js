const a = require('./test2.js');

console.log(a({ name: 'Hopa' }));

function * test() {
  yield 'foo';
}

const t = test();
console.log(t.next());

setInterval(() => {
  // console.log('fa');
}, 1000);