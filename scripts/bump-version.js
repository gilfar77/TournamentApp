import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read the package.json file
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse the current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Bump the patch version
const newVersion = `${major}.${minor}.${patch + 1}`;

// Update the version in package.json
packageJson.version = newVersion;

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Version bumped to ${newVersion}`); 