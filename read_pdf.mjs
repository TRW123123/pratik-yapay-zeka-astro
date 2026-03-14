import fs from 'fs';
import pdf from 'pdf-parse';

const dataBuffer = fs.readFileSync('C:\\Users\\User\\Downloads\\pseo_report_yapayzekapratik.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => {
    console.error("Error reading PDF:", err);
});
