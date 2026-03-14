const https = require('https');
const options = {
  hostname: 'api.dataforseo.com',
  path: '/v3/dataforseo_labs/locations_and_languages',
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + Buffer.from('info@st-automatisierung.de:26578ebca7a672e5').toString('base64')
  }
};
const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
        const data = JSON.parse(body);
        const locs = data.tasks[0].result;
        const tr = locs.filter(l => l.location_name.toLowerCase().includes('turk') || l.location_name.toLowerCase().includes('türk'));
        console.log(JSON.stringify(tr, null, 2));
    } catch(e) { console.error(e) }
  });
});
req.on('error', e => console.error(e));
req.end();
