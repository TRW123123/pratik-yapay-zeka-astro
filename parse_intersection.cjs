const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/Users/User/.gemini/antigravity/brain/3c7d0765-f260-4706-9350-b1865bb4644d/.system_generated/steps/5803/output.txt', 'utf8'));

const items = data.items[0].items || data.items; // Depending on DataForSEO structure
let keywords = [];

items.forEach(item => {
    if (item.keyword_data && item.keyword_data.keyword_info) {
        keywords.push({
            keyword: item.keyword_data.keyword,
            search_volume: item.keyword_data.keyword_info.search_volume,
            cpc: item.keyword_data.keyword_info.cpc,
            intent: item.keyword_data.search_intent_info?.main_intent || 'unknown'
        });
    }
});

// Sort by search volume descending
keywords.sort((a, b) => b.search_volume - a.search_volume);

// Print Top 50
console.log("Top 50 Intersecting B2B Keywords (parasut.com vs isbasi.com):");
console.log("---------------------------------------------------------------");
keywords.slice(0, 50).forEach((kw, i) => {
    console.log(`${i+1}. ${kw.keyword} (SV: ${kw.search_volume}, CPC: $${kw.cpc}, Intent: ${kw.intent})`);
});
