const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

const languageMetadata = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'docs/language-metadata.json'), 'utf8')
);

const languageCodes = languageMetadata.map(({ code }) => code);
const rtlLanguageCodes = new Set(languageMetadata.filter(({ rtl }) => rtl).map(({ code }) => code));

const localizedPageFiles = ['index.html', 'privacy.html', 'terms.html', '404.html'];

function getLocalizedPagePath(code, fileName) {
  if (code === 'tr') {
    return fileName === 'index.html' ? '/' : `/${fileName}`;
  }

  return fileName === 'index.html' ? `/${code}/` : `/${code}/${fileName}`;
}

function getLocalizedSourcePath(code, fileName) {
  return path.join(repoRoot, code === 'tr' ? '' : code, fileName);
}

function readTitleFromHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  if (!titleMatch) {
    throw new Error(`Title not found in ${filePath}`);
  }

  return titleMatch[1].replace(/\s+/g, ' ').trim();
}

function getLocalizedPageCases(fileNames = localizedPageFiles) {
  return languageMetadata.flatMap(({ code }) =>
    fileNames
      .map((fileName) => {
        const sourcePath = getLocalizedSourcePath(code, fileName);

        if (!fs.existsSync(sourcePath)) {
          return null;
        }

        return {
          code,
          fileName,
          path: getLocalizedPagePath(code, fileName),
          title: readTitleFromHtml(sourcePath),
        };
      })
      .filter(Boolean)
  );
}

function getAlternateHref(code, fileName) {
  const pagePath = getLocalizedPagePath(code, fileName);
  return `https://drivarc.com${pagePath}`;
}

module.exports = {
  repoRoot,
  languageMetadata,
  languageCodes,
  rtlLanguageCodes,
  localizedPageFiles,
  getLocalizedPagePath,
  getLocalizedSourcePath,
  readTitleFromHtml,
  getLocalizedPageCases,
  getAlternateHref,
};
