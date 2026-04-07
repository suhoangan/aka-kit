import path from 'path';
import fs from 'fs-extra';

const MANIFEST_FILE = '.ak-kit.json';

/**
 * Read the .ak-kit.json manifest from the target directory.
 * Returns null if no manifest exists.
 */
export function readManifest(targetDir) {
  const manifestPath = path.join(targetDir, MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return fs.readJsonSync(manifestPath);
  } catch {
    return null;
  }
}

/**
 * Write the .ak-kit.json manifest to the target directory.
 */
export function writeManifest(targetDir, manifest) {
  const manifestPath = path.join(targetDir, MANIFEST_FILE);
  fs.ensureDirSync(targetDir);
  fs.writeJsonSync(manifestPath, manifest, { spaces: 2 });
}
