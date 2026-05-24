import path from 'path';
import fs from 'fs-extra';

const MANIFEST_FILE = '.aka-kit.json';
/** @deprecated Pre-rename installs only */
const LEGACY_MANIFEST_FILE = '.akakit.json';

/**
 * Read install manifest from target directory.
 * Supports legacy `.akakit.json` from earlier builds.
 */
export function readManifest(targetDir) {
	for (const file of [MANIFEST_FILE, LEGACY_MANIFEST_FILE]) {
		const manifestPath = path.join(targetDir, file);
		if (!fs.existsSync(manifestPath)) continue;
		try {
			return fs.readJsonSync(manifestPath);
		} catch {
			return null;
		}
	}
	return null;
}

/** Write `.aka-kit.json` manifest to the target directory. */
export function writeManifest(targetDir, manifest) {
	const manifestPath = path.join(targetDir, MANIFEST_FILE);
	fs.ensureDirSync(targetDir);
	fs.writeJsonSync(manifestPath, manifest, { spaces: 2 });
}
