const fs = require('fs');
const https = require('https');

const API_USER = 'info@st-automatisierung.de';
const API_PASS = '26578ebca7a672e5';

// Hand-curated, highly specific keywords that accurately match the specific B2B service offerings.
const exactKeywords = [
  // 1. Core Services & Brand Positioning
  "yapay zeka ajansı", "yapay zeka danışmanlığı", "iş otomasyonu", "süreç otomasyonu",
  "b2b yapay zeka", "kurumsal yapay zeka", "yapay zeka çözümleri", "yapay zeka sistemleri",
  "özel chatgpt eğitimi", "chatgpt entegrasyonu", "openai api entegrasyonu", 
  "n8n danışmanlığı", "n8n uzmanı", "make.com uzmanı", "make.com danışmanlığı",
  "zapier uzmanı", "zapier entegrasyonu", "otomasyon ajansı", "iş süreçleri otomasyonu",
  "işletmeler için yapay zeka", "şirketler için yapay zeka", "yapay zeka ile iş geliştirme",
  "dijital dönüşüm danışmanlığı", "yapay zeka dönüşümü",
  
  // 2. Lead Generation & Sales Automation
  "yapay zeka ile müşteri bulma", "yapay zeka lead yönetimi", "b2b lead oluşturma",
  "satış otomasyonu", "b2b satış otomasyonu", "linkedin otomasyonu", "soğuk e-posta otomasyonu",
  "yapay zeka satış asistanı", "müşteri ilişkileri otomasyonu", "crm otomasyonu",
  "satış hunisi otomasyonu", "otomatik teklif hazırlama", "lead kalifikasyon otomasyonu",
  "hedef kitle analizi yapay zeka",

  // 3. Customer Support & Chatbots
  "yapay zeka chatbot", "whatsapp yapay zeka asistanı", "müşteri hizmetleri otomasyonu",
  "akıllı sohbet botu", "web sitesi için chatbot", "e-ticaret chatbot", "destek otomasyonu",
  "kurumsal whatsapp botu", "otomatik müşteri desteği", "7/24 yapay zeka desteği",
  "yapay zeka destek botu", "whatsapp otomasyonu",

  // 4. E-commerce (E-ticaret)
  "e-ticaret otomasyonu", "e-ticaret süreç otomasyonu", "e-ticaret yapay zeka çözümleri", 
  "shopify entegrasyonu", "woocommerce otomasyonu", "e-ticaret müşteri hizmetleri botu",
  "otomatik sipariş yönetimi", "stok takip otomasyonu", "e-ticaret iade otomasyonu",
  "yapay zeka ile ürün önerisi", "otomatik e-posta pazarlama",

  // 5. Legal (Hukuk)
  "hukuk bürosu otomasyonu", "avukatlar için yapay zeka", "sözleşme otomasyonu", 
  "dava takip otomasyonu", "hukuk yapay zeka asistanı", "hukuksal belge otomasyonu",
  "yapay zeka avukat botu", "hukuk bürosu dijitalleşme", "avukat asistan botu",

  // 6. Real Estate (Emlak / Gayrimenkul)
  "emlak firmaları için yapay zeka", "gayrimenkul otomasyonu", "emlak ilan otomasyonu", 
  "yapay zeka ile portföy yönetimi", "emlak whatsapp botu", "emlak müşteri asistanı",
  "otomatik ilan güncelleme", "gayrimenkul crm otomasyonu",

  // 7. Accounting & Finance (Muhasebe / Finans)
  "muhasebe süreç otomasyonu", "veri girişi otomasyonu", "finansal raporlama otomasyonu", 
  "muhasebe büroları için yapay zeka", "fatura otomasyonu", "otomatik fatura kesme",
  "fiş işleme otomasyonu", "gider takip otomasyonu", "muhasebe veri aktarımı",

  // 8. Human Resources (İnsan Kaynakları)
  "insan kaynakları otomasyonu", "işe alım otomasyonu", "ik yapay zeka çözümleri", 
  "cv eleme otomasyonu", "otomatik mülakat planlama", "personel yönetim otomasyonu",
  "çalışan memnuniyeti botu", "ik süreç optimizasyonu",

  // 9. Marketing (Pazarlama)
  "pazarlama otomasyonu", "içerik üretimi otomasyonu", "sosyal medya otomasyonu",
  "yapay zeka ile içerik üretimi", "sosyal medya botu", "seo otomasyonu",
  "blog yazma otomasyonu", "yapay zeka pazarlama araçları",

  // 10. General Operations & Productivity
  "operasyonel verimlilik artırma", "manuel işlerin otomasyonu", "raporlama otomasyonu", 
  "iş süreçleri dijitalleşme", "veri aktarım otomasyonu", "api entegrasyonu",
  "veri analizi otomasyonu", "belge yönetim otomasyonu", "otomatik rapor oluşturma",
  
  // 11. Custom Queries specific to Turkish market
  "türkiye yapay zeka ajansı", "yapay zeka uzmanı türkiye", "kurumsal yapay zeka eğitimi",
  "şirketler için chatgpt", "chatgpt kurumsal kullanım", "yapay zeka danışmanlık firmaları",
  "iş zekası otomasyonu", "yapay zeka destekli erp", "yapay zeka destekli crm"
];

// Deduplicate just in case
const ALL_KEYWORDS = Array.from(new Set(exactKeywords));
console.log(`Curated ${ALL_KEYWORDS.length} exact, high-intent keywords...`);

const tasksData = [{
  "location_code": 2792, // Turkey
  "language_code": "tr",
  "keywords": ALL_KEYWORDS
}];

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
      console.log(`Successfully mapped Search Volumes for ${sortedByVol.length} highly relevant keywords and saved to TR-KEYWORD-MASTER-DATASET.csv`);
      
    } catch(e) { 
      console.error("Parse Error: ", e); 
    }
  });
});

req.on('error', e => console.error(e));
req.write(JSON.stringify(tasksData));
req.end();
