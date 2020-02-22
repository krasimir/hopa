import fs from 'fs';

const c = 30;

function test() {
  return new Promise(done => {
    setTimeout(() => done('FooBar'), 1000);
  });
}

async function A() {
  const b = 23;
  const value = await test();
  console.log(value);
}

A();