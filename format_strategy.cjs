const fs = require('fs');

try {
    const rawData = fs.readFileSync('C:\\Users\\User\\.gemini\\antigravity\\brain\\3c7d0765-f260-4706-9350-b1865bb4644d\\.system_generated\\steps\\2276\\output.txt', 'utf8');
    const data = JSON.parse(rawData);

    let md = `# DataForSEO Strategic Angle Verification\n\n`;
    md += `Hier ist der direkte Vergleich zwischen den beiden Positionierungen (Agentur/Sales vs. Tools/Comparisons):\n\n`;
    md += `| Keyword | Suchvolumen (TR) | CPC ($) | Konkurrenz | Intent |\n`;
    md += `|---|---|---|---|---|\n`;

    if (data.items) {
        // Sort by search volume
        data.items.sort((a,b) => (b.keyword_info?.search_volume || 0) - (a.keyword_info?.search_volume || 0));

        data.items.forEach(item => {
            const kw = item.keyword;
            const sv = item.keyword_info?.search_volume || 0;
            const cpc = item.keyword_info?.cpc || 0;
            const comp = item.keyword_info?.competition_level || 'N/A';
            const intent = item.search_intent_info?.main_intent || 'N/A';
            
            md += `| ${kw} | **${sv}** | $${cpc.toFixed(2)} | ${comp} | ${intent} |\n`;
        });
    }

    fs.writeFileSync('C:\\Users\\User\\.gemini\\antigravity\\brain\\3c7d0765-f260-4706-9350-b1865bb4644d\\strategy_keyword_report.md', md);
    console.log("Strategic Report created successfully.");
} catch (e) {
    console.error(e);
}
