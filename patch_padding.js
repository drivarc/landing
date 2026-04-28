const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

const target = `
.features-title {
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--text-primary);
`;
const replace = `
.features-title {
    padding-top: 30px;
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--text-primary);
`;

const target2 = `
.problems-title {
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--text-primary);
`;
const replace2 = `
.problems-title {
    padding-top: 30px;
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--text-primary);
`;

const target3 = `
.faq-title {
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--text-primary);
`;
const replace3 = `
.faq-title {
    padding-top: 30px;
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--text-primary);
`;

css = css.replace(target, replace).replace(target2, replace2).replace(target3, replace3);
fs.writeFileSync('styles.css', css, 'utf8');
console.log('patched');
