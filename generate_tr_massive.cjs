const fs = require('fs');
const https = require('https');

const API_USER = 'info@st-automatisierung.de';
const API_PASS = '26578ebca7a672e5';

// 1. Core Arrays
const industries = [
  "e-ticaret", "emlak", "gayrimenkul", "sağlık", "lojistik", "muhasebe", "hukuk",
  "üretim", "eğitim", "finans", "turizm", "ihracat", "satış", "pazarlama", "insan kaynakları",
  "b2b", "kurumsal", "sanayi", "inşaat", "otomotiv", "diş hekimi", "doktor", "klinik",
  "danışmanlık", "ajans", "kobi", "şirket", "start-up", "tekstil", "restoran", "otel",
  "mimarlık", "mühendislik", "tarım", "gıda", "enerji", "teknoloji", "bilişim",
  "reklam ajansı", "sigorta", "nakliyat", "güvenlik", "temizlik", "güzellik merkezi",
  "spor salonu", "fitness", "e-ihracat", "toptan satış", "perakende", "kuyumcu",
  "oto galeri", "rent a car", "oto kiralama", "eczane", "hastane", "poliklinik",
  "dershane", "kurs", "okul", "kolej", "üniversite", "avukat", "mali müşavir",
  "diş kliniği", "veteriner"
];

const techTerms = [
  "yapay zeka", "otomasyon", "otomasyonu", "chatgpt", "bot", "yazılım", "yazılımı",
  "çözümleri", "ajansı", "danışmanlığı", "sistemleri", "entegrasyonu", "araçları",
  "programı", "uygulaması", "asistanı", "crm", "erp", "paneli", "firmaları",
  "şirketleri", "api", "n8n", "make.com"
];

const painPoints = [
  "müşteri bulma", "lead", "lead oluşturma", "potansiyel müşteri", "randevu alma",
  "satış artırma", "veri analizi", "içerik üretimi", "reklam", "müşteri hizmetleri",
  "müşteri desteği", "mesajlaşma", "e-posta", "teklif hazırlama",
  "fatura kesme", "stok takibi", "personel yönetimi", "işe alım", "cv eleme",
  "maaş hesaplama", "sipariş yönetimi", "kargo takibi", "iade yönetimi", "randevu sistemi",
  "talep yönetimi", "sosyal medya yönetimi", "dijital pazarlama", "seo"
];

const exactKeywords = [
  "iş otomasyonu", "süreç otomasyonu", "kurumsal yapay zeka",
  "özel chatgpt eğitimi", "openai api entegrasyonu", "n8n danışmanlığı",
  "zapier entegrasyonu", "iş süreçleri otomasyonu", "dijital dönüşüm danışmanlığı",
  "yapay zeka ile müşteri bulma", "b2b lead oluşturma", "satış otomasyonu", 
  "linkedin otomasyonu", "soğuk e-posta otomasyonu", "yapay zeka satış asistanı", 
  "müşteri ilişkileri otomasyonu", "satış hunisi otomasyonu", "akıllı sohbet botu",
  "web sitesi için chatbot", "7/24 yapay zeka desteği", "whatsapp otomasyonu",
  "shopify entegrasyonu", "woocommerce otomasyonu", "e-ticaret müşteri hizmetleri botu",
  "otomatik e-posta pazarlama", "sözleşme otomasyonu", "dava takip otomasyonu",
  "otomatik ilan güncelleme", "veri girişi otomasyonu", "finansal raporlama otomasyonu",
  "otomatik fatura kesme", "fiş işleme otomasyonu", "personel yönetim otomasyonu",
  "api entegrasyonu", "veri analizi otomasyonu", "iş zekası otomasyonu",
  "yapay zeka destekli erp", "yapay zeka destekli crm", "iş süreci yönetimi", 
  "robotik süreç otomasyonu", "iş akışı otomasyonu"
];

const kwSet = new Set();
exactKeywords.forEach(k => kwSet.add(k));

// Combo generation
industries.forEach(i => {
  techTerms.forEach(t => {
    kwSet.add(`${i} ${t}`);
    kwSet.add(`${i} için ${t}`);
  });
});

painPoints.forEach(p => {
  techTerms.forEach(t => {
    kwSet.add(`${p} ${t}`);
    kwSet.add(`${p} için ${t}`);
  });
});

industries.forEach(i => {
  painPoints.forEach(p => {
    kwSet.add(`${i} ${p}`);
    kwSet.add(`${i} için ${p}`);
  });
});

let ALL_KEYWORDS = Array.from(kwSet);

// Filter out overly long terms
ALL_KEYWORDS = ALL_KEYWORDS.filter(k => k.split(' ').length <= 5 && k.length < 80);

async function runTasksSequentially() {
  console.log(`Generated ${ALL_KEYWORDS.length} unique keywords.`);
  
  const chunkSize = 700;
  const tasksData = [];
  
  for (let i = 0; i < ALL_KEYWORDS.length; i += chunkSize) {
    tasksData.push({
      "location_code": 2792,
      "language_code": "tr",
      "keywords": ALL_KEYWORDS.slice(i, i + chunkSize)
    });
  }

  console.log(`Sending ${tasksData.length} tasks to DataForSEO sequentially...`);
  
  let allValid = [];
  
  for (let idx = 0; idx < tasksData.length; idx++) {
    console.log(`Processing Task ${idx + 1} of ${tasksData.length}...`);
    try {
      const data = await new Promise((resolve, reject) => {
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
          res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(JSON.stringify([tasksData[idx]])); // send 1 task at a time
        req.end();
      });
      
      if(data.status_code === 20000 && data.tasks) {
        data.tasks.forEach(task => {
          if (task.result) {
            task.result.forEach(resObj => {
               const kw = resObj.keyword;
               const sv = resObj.search_volume || 0;
               if (sv > 0) {
                 const cpc = resObj.cpc || 0;
                 const compIndex = resObj.competition_index || 0;
                 let comp = "LOW";
                 if (compIndex > 33 && compIndex <= 66) comp = "MEDIUM";
                 if (compIndex > 66) comp = "HIGH";
                 allValid.push({ kw, sv, cpc, comp });
               }
            });
          }
        });
      } else {
        console.error(`Task ${idx+1} failed with status: ${data.status_code}`);
      }
    } catch(err) {
      console.error(`Error on Task ${idx+1}: `, err);
    }
  }

  const sortedByVol = allValid.sort((a,b) => b.sv - a.sv);
  let csv = `"Keyword","Search Volume","CPC","Competition Level"\n`;
  sortedByVol.forEach(r => {
    csv += `"${r.kw.replace(/"/g, '""')}",${r.sv},${r.cpc.toFixed(2)},"${r.comp}"\n`;
  });

  const outPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\3c7d0765-f260-4706-9350-b1865bb4644d\\TR-MASSIVE-KEYWORD-DATASET.csv';
  fs.writeFileSync(outPath, csv);
  console.log(`Successfully mapped Search Volumes. Found ${allValid.length} valid active keywords out of ${ALL_KEYWORDS.length} total generated. Saved to TR-MASSIVE-KEYWORD-DATASET.csv`);
}

runTasksSequentially();
