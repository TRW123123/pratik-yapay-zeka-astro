const https = require('https');
const fs = require('fs');

const API_USER = 'info@st-automatisierung.de';
const API_PASS = '26578ebca7a672e5';

// Core seeds for the 5 Missing Angles
const seedKeywords = [
    // 1. Integrations & Tools
    'paraşüt entegrasyon', 'trendyol entegrasyon', 'salesforce türkiye', 'hubspot ajansı', 'n8n', 'zapier', 'ideasoft entegrasyon',
    // 2. Social & WhatsApp
    'whatsapp bot', 'whatsapp sipariş', 'instagram dm otomasyon', 'otomatik mesaj', 'müşteri hizmetleri botu',
    // 3. C-Level & Personas
    'işletmeler için yapay zeka', 'şirket otomasyonu', 'satış otomasyonu', 'dijital dönüşüm danışmanlık',
    // 4. Problem / Financial
    'maliyet düşürme', 'fatura otomasyonu', 'excel otomasyon', 'manuel işler', 'zaman tasarrufu',
    // 5. AI Content
    'yapay zeka video', 'otomatik blog', 'yapay zeka metin yazarlığı', 'sosyal medya yapay zeka'
];

let allKeywordsMap = new Map(); // keyword -> { search_volume, cpc, competition, seed }

function makeApiRequest(keyword) {
    return new Promise((resolve) => {
        const postData = [{
            "keyword": keyword,
            "location_code": 2792, // Turkey
            "language_code": "tr",
            "depth": 2, // Depth 2 to get substantial related keywords
            "include_clickstream_data": false
        }];

        const options = {
            hostname: 'api.dataforseo.com',
            path: '/v3/dataforseo_labs/google/related_keywords/live',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(API_USER + ':' + API_PASS).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    console.error("Parse Error:", e.message);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Error for ${keyword}:`, e.message);
            resolve(null);
        });

        req.write(JSON.stringify(postData));
        req.end();
    });
}

async function run() {
    console.log(`Starting to fetch related_keywords for ${seedKeywords.length} seeds...`);
    
    for (const seed of seedKeywords) {
        console.log(`Fetching related keywords for: "${seed}"`);
        const response = await makeApiRequest(seed);
        
        if (response && response.tasks && response.tasks[0] && response.tasks[0].result && response.tasks[0].result[0]) {
            const items = response.tasks[0].result[0].items || [];
            let count = 0;
            for (const item of items) {
                if (item.keyword_data && item.keyword_data.keyword_info) {
                    const kwInfo = item.keyword_data.keyword_info;
                    const kw = item.keyword_data.keyword;
                    const sv = kwInfo.search_volume || 0;
                    const cpc = kwInfo.cpc || 0;
                    const comp = kwInfo.competition_level || 'UNKNOWN';

                    // Only take highly relevant keywords that have SV >= 10
                    if (sv >= 10) {
                        if (!allKeywordsMap.has(kw) || allKeywordsMap.get(kw).search_volume < sv) {
                            allKeywordsMap.set(kw, {
                                search_volume: sv,
                                cpc: cpc,
                                competition: comp,
                                seed: seed
                            });
                            count++;
                        }
                    }
                }
            }
            console.log(` -> Found ${count} valid related keywords.`);
        } else {
            console.log(` -> No results or error.`);
        }

        // Avoid rate limiting
        await new Promise(res => setTimeout(res, 1000));
    }

    const finalResults = Array.from(allKeywordsMap.entries()).map(([kw, data]) => ({
        keyword: kw, ...data
    }));

    // Sort by search volume descending
    finalResults.sort((a, b) => b.search_volume - a.search_volume);

    // Save to CSV
    const csvHeader = '"Seed Angle","Keyword","Search Volume","CPC","Competition Level"\n';
    const csvRows = finalResults.map(r => `"${r.seed}","${r.keyword}",${r.search_volume},${r.cpc.toFixed(2)},"${r.competition}"`).join('\n');

    fs.writeFileSync('TR-MISSING-ANGLES-DATASET.csv', csvHeader + csvRows);
    console.log(`\nDONE! Saved ${finalResults.length} unique high-intent keywords to TR-MISSING-ANGLES-DATASET.csv`);
}

run();
