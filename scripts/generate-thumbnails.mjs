// scripts/generate-thumbnails.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const JSON_PATH = path.join(PROJECT_ROOT, 'lib', 'templates.json');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

console.log('🚀 Starting Mermaid SVG generation...\n');

const templates = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

templates.forEach(tpl => {
    if (!tpl.path || !tpl.thumbnailStatic) {
        console.error(`❌ CRITICAL: Template [${tpl.id}] is missing 'path' or 'thumbnailStatic' in JSON.`);
        return;
    }

    // 🛡️ AUTO-FIX: Ignore typos or old prefixes in the JSON!
    // This finds exactly where "templates/" or "thumbnails/" starts and grabs the rest.
    // e.g., "/mermaid-deesigner/templates/c4.mmd" -> "templates/c4.mmd"
    const safeInputPath = tpl.path.substring(tpl.path.indexOf('templates/'));
    const safeOutputPath = tpl.thumbnailStatic.substring(tpl.thumbnailStatic.indexOf('thumbnails/'));

    // Join the safe paths to the public directory
    const inputPath = path.join(PUBLIC_DIR, safeInputPath);
    const outputPath = path.join(PUBLIC_DIR, safeOutputPath);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!fs.existsSync(inputPath)) {
        console.warn(`⚠️  Skipped [${tpl.id}]: Source file not found at ${inputPath}`);
        return;
    }

    console.log(`⏳ Generating thumbnail for: ${tpl.title}...`);

    try {
        //const cmd = `npx mmdc -i "${inputPath}" -o "${outputPath}" -b transparent -t neutral`;
        // precise working version for local dev
        const cmd = `npx @mermaid-js/mermaid-cli -i "${inputPath}" -o "${outputPath}" -b transparent -t neutral`;
        // Change 'ignore' to 'pipe' so we can catch the real error output!
        execSync(cmd, { stdio: 'pipe' });
        console.log(`✅ Success: Saved to ${safeOutputPath}\n`);
    } catch (error) {
        console.error(`❌ Failed to generate ${tpl.id}.`);
        // Print the actual underlying error from Mermaid CLI / Puppeteer
        if (error.stderr) {
            console.error(`🔍 Root Cause: \n${error.stderr.toString()}`);
        } else {
            console.error(`🔍 Root Cause: ${error.message}`);
        }
    }
});

console.log('🎉 Script finished processing!');