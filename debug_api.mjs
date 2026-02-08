
const url = 'http://localhost:3000/api/stats';

async function test() {
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error(e);
  }
}

test();
