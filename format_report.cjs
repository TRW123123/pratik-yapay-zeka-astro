const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:\\Users\\User\\Projects\\Pratik Yapay Zeka\\pratik-yapay-zeka-astro\\seo_results.json', 'utf8'));

let md = `# DataForSEO Keyword Analyse: Özel Liste (Tümü)

| Keyword | Suchvolumen (TR) | CPC ($) | Konkurrenz |
|---|---|---|---|
`;

if (data.tasks && data.tasks[0].result) {
    const results = data.tasks[0].result;
    
    // Results is an array of objects straight from the result array
    let allItems = results;

    allItems.sort((a,b) => (b.search_volume || 0) - (a.search_volume || 0));

    const seen = new Set();
    allItems.forEach(item => {
        const kw = item.keyword;
        if(seen.has(kw)) return;
        seen.add(kw);
        
        let sv = item.search_volume !== null ? item.search_volume : 0;
        let cpc = item.cpc !== null ? item.cpc : 0;
        let comp = item.competition !== null ? item.competition : 'N/A';
        // Google Ads API usually doesn't return intent directly in this response
        
        md += `| ${kw} | **${sv}** | $${cpc.toFixed(2)} | ${comp} |\n`;
    });
    
    fs.writeFileSync('C:\\Users\\User\\.gemini\\antigravity\\brain\\3c7d0765-f260-4706-9350-b1865bb4644d\\seo_keyword_report.md', md);
    console.log("Report generated at seo_keyword_report.md");
} else {
    console.error("No valid results found in seo_results.json");
}
