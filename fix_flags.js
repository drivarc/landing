const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

// Update textContent to innerHTML to allow tags
content = content.replace(
    'if (flag) toggleFlag.textContent = flag.textContent.trim();',
    'if (flag) toggleFlag.innerHTML = flag.innerHTML.trim();'
);

// We need to inject the emoji-replacement code inside DOMContentLoaded
const replacementCode = `

        // Fix Windows flag emojis
        if (/Win|Windows/.test(navigator.platform || navigator.userAgent) && !/Firefox/.test(navigator.userAgent)) {
            var flagMap = {
                '🇹🇷': '1f1f9-1f1f7',
                '🇬🇧': '1f1ec-1f1e7',
                '🇩🇪': '1f1e9-1f1ea',
                '🇷🇺': '1f1f7-1f1fa',
                '🇸🇦': '1f1f8-1f1e6',
                '🇨🇳': '1f1e8-1f1f3'
            };
            document.querySelectorAll('.lang-flag, .lang-flag-icon').forEach(function(el) {
                var t = el.textContent.trim();
                if (flagMap[t]) {
                    el.innerHTML = '<img src="https://cdn.jsdelivr.net/npm/@twemoji/api@14.1.0/dist/svg/' + flagMap[t] + '.svg" style="width:1.2em; height:1.2em; vertical-align:middle;" alt="' + t + '">';
                }
            });
        }
`;

// Insert right after htmlLang determination or after toggleCode is set
content = content.replace(
    'if (toggleCode) toggleCode.textContent = htmlLang.toUpperCase();\n        }',
    'if (toggleCode) toggleCode.textContent = htmlLang.toUpperCase();\n        }\n' + replacementCode
);

fs.writeFileSync('app.js', content, 'utf8');
console.log('Done!');
