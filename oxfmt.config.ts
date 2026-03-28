import { defineConfig } from 'oxfmt';

export default defineConfig({
    tabWidth: 4,
    singleQuote: true,
    trailingComma: 'none',
    arrowParens: 'avoid',
    printWidth: 150,
    ignorePatterns: ['docs', 'dist', '*.md', '*.min.css', '*.min.js']
});
