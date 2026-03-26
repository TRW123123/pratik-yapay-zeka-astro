import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src', 'pages');

const filesToFix = [
  'maas-hesaplama-motoru.astro',
  'kidem-tazminati-hesaplama.astro',
  'ihbar-tazminati-hesaplama.astro',
  'isverene-maliyet-hesaplama.astro',
  'fazla-mesai-hesaplama.astro',
  'yillik-izin-ucreti-hesaplama.astro',
  'gecikme-zammi-hesaplama.astro',
  'arac-deger-kaybi-hesaplama.astro',
  'bordro-hesaplama.astro',
  'vergi-iadesi-hesaplama.astro'
];

filesToFix.forEach(f => {
  const file = path.join(dir, f);
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the import
    content = content.replace(
      /import SolutionLayout from '\.\.\/layouts\/SolutionLayout\.astro';/g, 
      "import CalculatorLayout from '../layouts/CalculatorLayout.astro';"
    );
    
    // Replace the opening tag
    content = content.replace(
      /<SolutionLayout/g, 
      '<CalculatorLayout'
    );
    
    // Replace the closing tag
    content = content.replace(
      /<\/SolutionLayout>/g, 
      '</CalculatorLayout>'
    );
    
    fs.writeFileSync(file, content);
    console.log('Fixed layout in', f);
  } else {
    console.log('Not found', f);
  }
});
