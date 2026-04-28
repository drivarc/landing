const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

const target = `    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);`;

const replacement = `    setTimeout(() => {
        const yOffset = section.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }, 50);`;

content = content.replace(target, replacement);
fs.writeFileSync('app.js', content, 'utf8');
console.log("Patched to scrollTo!");
