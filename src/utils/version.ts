import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;

// Format: v0.2.0 (build date)
export const APP_VERSION_WITH_DATE = `v${packageJson.version} (${new Date().toISOString().split('T')[0]})`; 