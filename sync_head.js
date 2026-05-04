const fs = require('fs');

const replacementBlock = `
	    <link rel="stylesheet" href="../styles-base.css" id="siteStyles">
	    <link rel="stylesheet" href="../styles-header.css">
	    <link rel="stylesheet" href="../styles-hero.css">
	    <link rel="stylesheet" href="../styles-features.css">
	    <link rel="stylesheet" href="../styles-problems.css">
	    <link rel="stylesheet" href="../styles-phone.css">
	    <link rel="stylesheet" href="../styles-faq.css">
	    <link rel="stylesheet" href="../styles-footer.css">
	    <link rel="stylesheet" href="../styles-modals.css">
	    <link rel="stylesheet" href="../styles-animations.css">
	    <link rel="stylesheet" href="../styles-rtl.css">
	    <link rel="stylesheet" href="../footer-socials.css">
    
    
    <script src="../seo-jsonld.js" defer></script>
    <script src="../analytics.js" defer></script>
    <script src="../app-core.js" defer></script>
    <script src="../app-scroll.js" defer></script>
    <script src="../app-ui.js" defer></script>
    <script src="../app-cookie.js" defer></script>
    <script src="../app-init.js" defer></script>
`;

const files = ['ar/index.html', 'de/index.html', 'en/index.html', 'ru/index.html', 'zh/index.html'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/<link[^>]*href="\.\.\/styles-[^>]*\.css"[^>]*>(\r?\n\s*)?/g, '');
    content = content.replace(/<link[^>]*href="\.\.\/footer-socials\.css"[^>]*>(\r?\n\s*)?/g, '');
    content = content.replace(/<link[^>]*href="\.\.\/styles\.css"[^>]*>(\r?\n\s*)?/g, '');
    
    content = content.replace(/<script[^>]*src="\.\.\/seo-jsonld\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/analytics\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/app\.min\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/app\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/footer-cookie-fix\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/app-core\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/app-scroll\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/app-ui\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/app-cookie\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');
    content = content.replace(/<script[^>]*src="\.\.\/app-init\.js"[^>]*><\/script>(\r?\n\s*)?/g, '');

    content = content.replace('</head>', replacementBlock.trimStart() + '</head>');
    
    fs.writeFileSync(file, content, 'utf8');
}
console.log('Done!');
