const fs = require('fs');
let code = fs.readFileSync('styles-hero.css', 'utf-8');

// 768px
code = code.replace(
  /\.hero-actions \{\s+flex-direction: row;\s+width: 100%;\s+gap: 12px;\s+align-items: center;\s+justify-content: center;\s*\}/g,
  `.hero-actions {\n        flex-direction: row;\n        width: 100%;\n        gap: 12px;\n        align-items: center;\n        justify-content: center;\n    }\n    .btn-google-play,\n    .btn-app-store {\n        flex: 1;\n        max-width: none;\n        width: 100%;\n        justify-content: center;\n        padding: 14px 16px;\n    }\n    .google-play-store,\n    .app-store-name { font-size: 14px; }\n    .google-play-icon,\n    .app-store-icon { width: 18px; height: 18px; }`
);

// 480px
code = code.replace(
  /\.hero-actions \{\s+flex-direction: row;\s+width: 100%;\s+gap: 10px;\s+align-items: center;\s+justify-content: center;\s*\}/g,
  `.hero-actions {\n        flex-direction: row;\n        width: 100%;\n        gap: 10px;\n        align-items: center;\n        justify-content: center;\n    }\n    .btn-google-play,\n    .btn-app-store {\n        flex: 1;\n        max-width: none !important;\n        width: 100%;\n        justify-content: center;\n        padding: 12px 14px;\n    }\n    .google-play-icon,\n    .app-store-icon { width: 16px; height: 16px; }\n    .google-play-store,\n    .app-store-name { font-size: 13px; }\n    .google-play-label { font-size: 10px; }`
);

// 375px
code = code.replace(
  /\.hero-actions \{\s+flex-direction: row;\s+width: 100%;\s+gap: 8px;\s*\}/g,
  `.hero-actions {\n        flex-direction: row;\n        width: 100%;\n        gap: 8px;\n    }\n    .btn-google-play,\n    .btn-app-store {\n        flex: 1;\n        max-width: none !important;\n        width: 100%;\n        justify-content: center;\n        padding: 11px 14px;\n    }\n    .google-play-icon,\n    .app-store-icon { width: 16px; height: 16px; }\n    .google-play-store,\n    .app-store-name { font-size: 14px; }\n    .google-play-label { font-size: 11px; }`
);

// 320px
code = code.replace(
  /\.hero-actions \{\s+flex-direction: row;\s+width: 100%;\s+gap: 6px;\s*\}/g,
  `.hero-actions {\n        flex-direction: row;\n        width: 100%;\n        gap: 6px;\n    }\n    .btn-google-play,\n    .btn-app-store {\n        flex: 1;\n        max-width: none;\n        width: 100%;\n        justify-content: center;\n        padding: 10px 12px;\n    }\n    .google-play-icon,\n    .app-store-icon { width: 15px; height: 15px; }\n    .google-play-store,\n    .app-store-name { font-size: 13px; }`
);

fs.writeFileSync('styles-hero.css', code);
