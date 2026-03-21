const fs = require('fs');
const https = require('https');

const API_USER = 'info@st-automatisierung.de';
const API_PASS = '26578ebca7a672e5';

// 1. Generate Massive Keyword Matrix
const sectors = [
  "e-ticaret", "emlak", "gayrimenkul", "sağlık", "lojistik", "muhasebe", "hukuk", 
  "üretim", "eğitim", "finans", "turizm", "ihracat", "satış", "pazarlama", "insan kaynakları",
  "b2b", "kurumsal", "sanayi", "inşaat", "otomotiv", "diş hekimi", "doktor", "klinik",
  "danışmanlık", "ajans", "kobi", "şirket", "start-up"
];

const painPoints = [
  "müşteri bulma", "lead oluşturma", "potansiyel müşteri", "randevu alma", 
  "satış artırma", "maliyet düşürme", "zaman tasarrufu", "veri analizi", "içerik üretimi",
  "reklam", "pazarlama", "müşteri hizmetleri", "destek", "mesajlaşma", "e-posta"
];

const techTerms = [
  "yapay zeka", "otomasyon", "chatgpt", "bot", "yazılım", "çözümleri", 
  "ajansı", "danışmanlığı", "sistemleri", "entegrasyonu", "araçları", "programı"
];

const kwSet = new Set();

// Matrix 1: Sector + Tech
sectors.forEach(s => {
  techTerms.forEach(t => {
    kwSet.add(`${s} ${t}`);
    kwSet.add(`${s} için ${t}`);
  });
});

// Matrix 2: Pain + Tech
painPoints.forEach(p => {
  techTerms.forEach(t => {
    kwSet.add(`${p} ${t}`);
    kwSet.add(`${t} ile ${p}`);
  });
});

// Basic high converting broad terms
const base = [
  "süreç optimizasyonu", "iş otomasyonu", "yapay zeka danışmanlığı", "b2b otomasyon",
  "satış otomasyonu", "pazarlama otomasyonu", "üretim otomasyonu", "lead bulma", 
  "yapay zeka ajansı", "chatgpt kurumsal", "openai entegrasyonu", "n8n uzmanı"
];
base.forEach(b => kwSet.add(b));

const ALL_KEYWORDS = Array.from(kwSet).slice(0, 1500); // 1500 limit to be safe

console.log(`Matrix generated ${ALL_KEYWORDS.length} keywords. Splitting into chunks of 700...`);

// Google Ads Search Volume endpoint limits up to 700 keywords per task
const chunkSize = 700;
const tasksData = [];

for (let i = 0; i < ALL_KEYWORDS.length; i += chunkSize) {
  const chunk = ALL_KEYWORDS.slice(i, i + chunkSize);
  tasksData.push({
    "location_code": 2792, // Turkey
    "language_code": "tr",
    "keywords": chunk
  });
}

const options = {
  hostname: 'api.dataforseo.com',
  path: '/v3/keywords_data/google_ads/search_volume/live',
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + Buffer.from(API_USER + ':' + API_PASS).toString('base64'),
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      if(data.status_code !== 20000) {
        console.error("API Error: ", JSON.stringify(data, null, 2));
        return;
      }

      const results = [];

      data.tasks.forEach(task => {
        if (task.result) {
          task.result.forEach(resObj => {
             const kw = resObj.keyword;
             const sv = resObj.search_volume || 0;
             const cpc = resObj.cpc || 0;
             const compIndex = resObj.competition_index || 0;
             
             let comp = "LOW";
             if (compIndex > 33 && compIndex <= 66) comp = "MEDIUM";
             if (compIndex > 66) comp = "HIGH";

             results.push({ kw, sv, cpc, comp });
          });
        }
      });

      const sortedByVol = results.sort((a,b) => b.sv - a.sv);

      // Export
      let csv = `"Keyword","Search Volume","CPC","Competition Level"\n`;
      sortedByVol.forEach(r => {
        csv += `"${r.kw.replace(/"/g, '""')}",${r.sv},${r.cpc.toFixed(2)},"${r.comp}"\n`;
      });

      const outPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\3c7d0765-f260-4706-9350-b1865bb4644d\\TR-KEYWORD-MASTER-DATASET.csv';
      fs.writeFileSync(outPath, csv);
      console.log(`Successfully mapped Search Volumes for ${sortedByVol.length} keywords and saved to TR-KEYWORD-MASTER-DATASET.csv`);
      
    } catch(e) { 
      console.error("Parse Error: ", e); 
    }
  }); // end res.on
});

req.on('error', e => console.error(e));
req.write(JSON.stringify(tasksData));
req.end();
