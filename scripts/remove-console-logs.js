#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to process
const directoriesToProcess = ['src'];

// File extensions to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns to remove
const consolePatterns = [
  /console\.(log|warn|error|info|debug|trace)\([^)]*\);?\s*/g,
  /console\.(log|warn|error|info|debug|trace)\([^)]*\)[^;]*;?\s*/g,
];

let filesProcessed = 0;
let consoleStatementsRemoved = 0;

function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let localCount = 0;

    consolePatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        localCount += matches.length;
        content = content.replace(pattern, '');
      }
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesProcessed++;
      consoleStatementsRemoved += localCount;
      console.log(
        `✓ Processed ${filePath} - Removed ${localCount} console statements`
      );
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      processDirectory(filePath);
    } else if (stat.isFile() && fileExtensions.includes(path.extname(file))) {
      removeConsoleLogs(filePath);
    }
  });
}

console.log('🔍 Removing console statements from production code...\n');

directoriesToProcess.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  }
});

console.log('\n📊 Summary:');
console.log(`Files processed: ${filesProcessed}`);
console.log(`Console statements removed: ${consoleStatementsRemoved}`);
console.log(
  '\n✅ Done! Remember to test your app after removing console statements.'
);
