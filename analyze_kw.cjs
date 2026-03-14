const fs = require('fs');
const https = require('https');

const keywords = [
  "e-ticaret için yapay zeka satış otomasyonu",
  "emlak sektörü için yapay zeka otomasyonu",
  "sağlık sektörü için yapay zeka otomasyonu",
  "finans için yapay zeka otomasyon çözümleri",
  "hukuk bürosu için yapay zeka otomasyonu",
  "muhasebe firması yapay zeka otomasyonu",
  "lojistik şirketleri için yapay zeka",
  "inşaat sektörü yapay zeka otomasyonu",
  "perakende için satış otomasyonu yapay zeka",
  "sigorta şirketleri yapay zeka lead otomasyonu",
  "eğitim kurumları için yapay zeka otomasyonu",
  "turizm sektörü için yapay zeka satış otomasyonu",
  "SaaS şirketleri için yapay zeka satış otomasyonu",
  "danışmanlık firması yapay zeka lead kazanımı",
  "üretim sektörü yapay zeka CRM otomasyonu",
  "sağlık turizmi yapay zeka lead otomasyonu",
  "KOBİ'ler için yapay zeka satış otomasyonu",
  "ihracat şirketleri için yapay zeka otomasyonu",
  "dijital ajanslar için yapay zeka iş akışı",
  "B2B satış otomasyonu yapay zeka Türkiye",
  "yapay zeka ile lead kazanma nasıl yapılır",
  "yapay zeka ile soğuk e-posta otomasyonu",
  "yapay zeka ile LinkedIn outreach otomasyonu",
  "yapay zeka ile müşteri takibi otomasyonu",
  "yapay zeka ile otomatik teklif oluşturma",
  "yapay zeka ile otomatik randevu sistemi",
  "yapay zeka ile içerik üretimi otomasyonu",
  "yapay zeka ile otomatik CRM doldurma",
  "web sitesine yapay zeka chatbot nasıl kurulur",
  "yapay zeka ile upsell otomasyonu nasıl çalışır",
  "yapay zeka ile müşteri segmentasyonu",
  "yapay zeka ile reklam otomasyonu",
  "yapay zeka ile Instagram DM otomasyonu",
  "speed-to-lead sistemi yapay zeka ile nasıl kurulur",
  "yapay zeka ile satış tahmini otomasyonu",
  "HubSpot yapay zeka entegrasyonu nasıl yapılır",
  "Salesforce yapay zeka otomasyonu Türkiye",
  "n8n ile satış otomasyonu kurulumu",
  "Make ile yapay zeka otomasyonu nasıl kurulur",
  "Pipedrive yapay zeka entegrasyonu",
  "LinkedIn yapay zeka otomasyon aracı",
  "WhatsApp yapay zeka chatbot kurulumu",
  "Instagram chatbot yapay zeka ile nasıl kurulur",
  "Zoho CRM yapay zeka entegrasyonu",
  "ChatGPT satış otomasyonu nasıl kullanılır",
  "Google Sheets yapay zeka otomasyon entegrasyonu",
  "Notion CRM yapay zeka entegrasyonu",
  "Slack yapay zeka bildirim otomasyonu",
  "Webflow yapay zeka chatbot entegrasyonu",
  "ActiveCampaign yapay zeka otomasyonu",
  "Almanya pazarına yapay zeka satış otomasyonu",
  "Hollanda'ya ihracat için yapay zeka outreach",
  "İngiltere pazarı için çok dilli AI satış",
  "Dubai pazarı için yapay zeka lead otomasyonu",
  "Suudi Arabistan B2B satış otomasyonu yapay zeka",
  "ABD pazarına açılmak için yapay zeka satış",
  "Avrupa pazarı için yapay zeka çok dilli outreach",
  "MENA bölgesi için yapay zeka satış otomasyonu",
  "HubSpot vs Salesforce Türkiye hangisi daha iyi",
  "Make vs n8n otomasyon karşılaştırması",
  "Pipedrive vs HubSpot KOBİ için",
  "ActiveCampaign alternatifleri Türkiye",
  "Zapier vs Make yapay zeka otomasyonu",
  "LinkedIn outreach araçları karşılaştırması",
  "yapay zeka chatbot platformları karşılaştırması Türkiye",
  "CRM yazılımları karşılaştırması KOBİ Türkiye"
];

const options = {
  hostname: 'api.dataforseo.com',
  path: '/v3/dataforseo_labs/google/keyword_suggestions/live', // fallback using short version of keywords
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + Buffer.from('info@st-automatisierung.de:26578ebca7a672e5').toString('base64'),
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
        const data = JSON.parse(body);
        fs.writeFileSync('C:\\Users\\User\\Projects\\Pratik Yapay Zeka\\pratik-yapay-zeka-astro\\seo_results.json', JSON.stringify(data, null, 2));
        console.log("Written results to seo_results.json");
    } catch(e) { console.error(e) }
  });
});

// For exactly matching metrics instead of "suggestions", we just run keyword_metrics
// Actually, earlier the keyword_metrics 404 was due to a trailing dot or something.
// Let's use search_volume endpoint from Ads instead, standard Google Ads API endpoint.
req.path = '/v3/keywords_data/google_ads/search_volume/live';

const postData = JSON.stringify([{
    "location_name": "Turkiye",
    "language_name": "Turkish",
    "keywords": keywords
}]);

req.on('error', e => console.error(e));
req.write(postData);
req.end();
