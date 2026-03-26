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
    
    // Remove the import
    content = content.replace(/import \{ Badge \} from ".*?\/components\/ui\/badge";?/g, '');
    
    // Replace the tag
    content = content.replace(
      /<Badge variant="outline" class="mb-4 border-primary text-primary">(.*?)<\/Badge>/g, 
      '<div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-primary text-primary mb-4">$1</div>'
    );
    
    fs.writeFileSync(file, content);
    console.log('Fixed', f);
  } else {
    console.log('Not found', f);
  }
});
