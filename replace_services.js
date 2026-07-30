const fs = require('fs');

const replacement = fs.readFileSync('frontend/services_gen.txt', 'utf8');
const file = 'frontend/index.html';
let content = fs.readFileSync(file, 'utf8');

const startTag = '<div class="services-grid">';
const endTag = '    </div>\n  </div>\n</section>\n\n<!-- ════════════════════════════════════════════════════════\n     WHY MAYA — FEATURE SPLIT';

let startIndex = content.indexOf(startTag);
if (startIndex !== -1) {
    let endIndex = content.indexOf('  </div>\n</section>\n\n<!-- ════════════════════════════════════════════════════════\n     WHY MAYA — FEATURE SPLIT', startIndex);
    
    if (endIndex !== -1) {
        let newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
        fs.writeFileSync(file, newContent);
        console.log(`Updated ${file}`);
    } else {
        console.log(`Could not find end tag in ${file}`);
    }
} else {
    console.log(`Could not find start tag in ${file}`);
}
