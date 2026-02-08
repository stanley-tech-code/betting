const apiKey = process.env.PROPELLER_API_KEY || '681766321ea5b02f6c1b5be1c6088089241ca81b202b29a1';
const API_BASE_URL = 'https://ssp-api.propellerads.com/v5/adv';
const dateFrom = '2024-01-01';
const dateTo = '2026-02-08';

async function testFetch() {
  const statsUrl = `${API_BASE_URL}/statistics?day_from=${dateFrom}&day_to=${dateTo}&group_by[]=campaign_id`;
  console.log(`URL: ${statsUrl}`);

  try {
    const res = await fetch(statsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await res.json();
    console.log(`Items count: ${data.items ? data.items.length : 'N/A'}`);
    if (data.items && data.items.length > 0) {
      console.log('First item keys:', Object.keys(data.items[0]));
      console.log('First item sample:', JSON.stringify(data.items[0], null, 2));
    } else {
      console.log('No items found');
      console.log('Full Raw Body:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

testFetch();
