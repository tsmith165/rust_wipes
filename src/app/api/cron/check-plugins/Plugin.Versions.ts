import { PluginInfo } from './Plugin.Types';
import { PluginData } from '@/db/schema';

export interface VersionComparisonResult {
    name: string;
    currentVersion: string;
    expectedVersion: string;
    highestSeenVersion: string;
    author: string | null;
    needsUpdate: boolean;
}

/**
 * Compares version strings in the format "x.y.z"
 * Returns:
 * - positive number if version1 > version2
 * - negative number if version1 < version2
 * - 0 if version1 === version2
 */
export function compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1 = v1Parts[i] || 0;
        const v2 = v2Parts[i] || 0;
        if (v1 !== v2) {
            return v1 - v2;
        }
    }
    return 0;
}

/**
 * Compares current plugin data against expected plugin data
 */
export function comparePluginVersions(currentPlugins: PluginInfo[], expectedPlugins: PluginData[]): VersionComparisonResult[] {
    const results: VersionComparisonResult[] = [];

    // Process all current plugins
    for (const currentPlugin of currentPlugins) {
        const expectedPlugin = expectedPlugins.find((p) => p.name === currentPlugin.name);

        if (!expectedPlugin) {
            // New plugin not in database
            results.push({
                name: currentPlugin.name,
                currentVersion: currentPlugin.version,
                expectedVersion: currentPlugin.version, // Set expected to current since it's new
                highestSeenVersion: currentPlugin.version,
                author: currentPlugin.author,
                needsUpdate: false,
            });
            continue;
        }

        // Compare versions
        const needsUpdate = compareVersions(currentPlugin.version, expectedPlugin.current_version) < 0;

        results.push({
            name: currentPlugin.name,
            currentVersion: currentPlugin.version,
            expectedVersion: expectedPlugin.current_version,
            highestSeenVersion: expectedPlugin.highest_seen_version,
            author: currentPlugin.author,
            needsUpdate,
        });
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
}
