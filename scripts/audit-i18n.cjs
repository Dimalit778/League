const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const srcRoot = path.join(root, 'src');
const translationsPath = path.join(srcRoot, 'lib/i18n/translations.ts');
const localePaths = {
  en: path.join(srcRoot, 'lib/i18n/locales/en.ts'),
  he: path.join(srcRoot, 'lib/i18n/locales/he.ts'),
};
const translationSourcePaths = new Set([translationsPath, ...Object.values(localePaths)]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') return [];
      return walk(fullPath);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function loadLocale(filePath, exportName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(() => ({}), module, module.exports);
  return module.exports[exportName];
}

function flattenTranslations(value, result = {}) {
  for (const [key, entry] of Object.entries(value)) {
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      flattenTranslations(entry, result);
    } else {
      result[key] = entry;
    }
  }
  return result;
}

function loadTranslations() {
  return {
    en: flattenTranslations(loadLocale(localePaths.en, 'en')),
    he: flattenTranslations(loadLocale(localePaths.he, 'he')),
  };
}

function location(sourceFile, node) {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${path.relative(root, sourceFile.fileName)}:${line + 1}`;
}

const translations = loadTranslations();
const files = walk(srcRoot).filter((file) => !translationSourcePaths.has(file) && !file.endsWith('.d.ts'));
const usedKeys = new Set();
const dynamicCalls = [];
const rawText = [];
const rawAttributes = [];
const rawExpressionText = [];
const userFacingAttributes = new Set([
  'accessibilityHint',
  'accessibilityLabel',
  'description',
  'label',
  'message',
  'placeholder',
  'title',
]);
// Product names and universal abbreviations are intentionally not translated.
const rawTextAllowlist = new Set(['CHAMPO', 'Champion', 'EN', 'FT', 'LIVE', 'League', 'עב']);
const productionSource = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      const isTranslationCall =
        (ts.isIdentifier(expression) && (expression.text === 't' || expression.text === 'translateRaw')) ||
        (ts.isPropertyAccessExpression(expression) && expression.name.text === 't');
      if (isTranslationCall) {
        const keyArgument = expression.text === 'translateRaw' ? node.arguments[1] : node.arguments[0];
        if (keyArgument && (ts.isStringLiteral(keyArgument) || ts.isNoSubstitutionTemplateLiteral(keyArgument))) {
          usedKeys.add(keyArgument.text.replace(/\s+/g, ' ').trim());
        } else if (keyArgument) {
          dynamicCalls.push(`${location(sourceFile, keyArgument)} ${keyArgument.getText(sourceFile)}`);
        }
      }
    }

    if (ts.isJsxText(node)) {
      const text = node.text.replace(/\s+/g, ' ').trim();
      if (text && /[A-Za-z\u0590-\u05ff]/.test(text) && !rawTextAllowlist.has(text)) {
        rawText.push(`${location(sourceFile, node)} ${text}`);
      }
    }

    if (
      ts.isJsxAttribute(node) &&
      userFacingAttributes.has(node.name.text) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      const text = node.initializer.text.trim();
      if (text && /[A-Za-z\u0590-\u05ff]/.test(text) && !rawTextAllowlist.has(text)) {
        rawAttributes.push(`${location(sourceFile, node)} ${node.name.text}=${JSON.stringify(text)}`);
      }
    }

    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      node.parent &&
      ts.isJsxExpression(node.parent) &&
      !ts.isJsxAttribute(node.parent.parent)
    ) {
      const text = node.text.replace(/\s+/g, ' ').trim();
      if (text && /[A-Za-z\u0590-\u05ff]/.test(text) && !rawTextAllowlist.has(text)) {
        rawExpressionText.push(`${location(sourceFile, node)} ${JSON.stringify(text)}`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

const enKeys = new Set(Object.keys(translations.en));
const heKeys = new Set(Object.keys(translations.he));
const missingEn = [...usedKeys].filter((key) => !enKeys.has(key)).sort();
const missingHe = [...usedKeys].filter((key) => !heKeys.has(key)).sort();
const onlyEn = [...enKeys].filter((key) => !heKeys.has(key)).sort();
const onlyHe = [...heKeys].filter((key) => !enKeys.has(key)).sort();
const unused = [...enKeys]
  .filter((key) => heKeys.has(key) && !usedKeys.has(key) && !productionSource.includes(key))
  .sort();
const sameAsEnglish = [...enKeys]
  .filter(
    (key) => heKeys.has(key) && translations.en[key] === translations.he[key] && /[A-Za-z]/.test(translations.en[key]),
  )
  .sort();

const report = {
  counts: {
    english: enKeys.size,
    hebrew: heKeys.size,
    staticUsed: usedKeys.size,
    dynamicCalls: dynamicCalls.length,
    rawJsxText: rawText.length,
    rawJsxAttributes: rawAttributes.length,
    rawJsxExpressions: rawExpressionText.length,
  },
  missingEn,
  missingHe,
  onlyEn,
  onlyHe,
  unused,
  sameAsEnglish,
  dynamicCalls,
  rawText,
  rawAttributes,
  rawExpressionText,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

const blockingIssues = {
  missingEn,
  missingHe,
  onlyEn,
  onlyHe,
  unused,
  rawText,
  rawAttributes,
  rawExpressionText,
};

if (Object.values(blockingIssues).some((issues) => issues.length > 0)) {
  process.exitCode = 1;
}
