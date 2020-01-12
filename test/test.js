const a = require('./test2.js');

console.log(a());

function * test() {
  yield 'fooa';
}

const t = test();
console.log(t.next());

setInterval(() => {
  // console.log('fa'); 
}, 1000);