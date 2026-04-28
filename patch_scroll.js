const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

const target = `    requestAnimationFrame(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });`;

const replacement = `    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('app.js', content, 'utf8');
    console.log("Patched!");
} else {
    console.log("Not found.");
}
