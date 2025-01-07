import { PluginInfo, PluginParseResult } from './Plugin.Types';

const DEBUG_ENABLED = false;

function debug(...args: any[]) {
    if (DEBUG_ENABLED) {
        console.log('[Plugin Parser Debug]', ...args);
    }
}

export function parsePluginOutput(output: string): PluginParseResult {
    try {
        debug('Initial output:', output);

        // Parse the outer JSON structure (server response)
        let pluginList = output;
        try {
            debug('Attempting to parse outer JSON');
            const outerParsed = JSON.parse(output);
            debug('Parsed outer JSON:', outerParsed);

            // Parse the inner JSON (response field)
            const innerParsed = JSON.parse(outerParsed.response);
            debug('Parsed inner JSON:', innerParsed);

            // Get the actual content
            pluginList = innerParsed.content;
            debug('Extracted content:', pluginList);
        } catch (error) {
            debug('JSON parse failed, using raw output:', error);
            pluginList = output;
        }

        // Get total plugins count from first line
        const lines = pluginList.split('\n').filter((line) => line.trim());
        debug('Total lines after split:', lines.length);
        debug('First line:', lines[0]);

        const firstLine = lines[0];
        const totalMatch = firstLine.match(/Listing (\d+) plugins/);
        debug('Total match result:', totalMatch);

        if (!totalMatch) {
            debug('Failed to match plugin count in first line');
            return {
                success: false,
                error: 'Invalid plugin list format: Missing plugin count',
            };
        }

        const totalPlugins = parseInt(totalMatch[1], 10);
        debug('Expected plugin count:', totalPlugins);
        const plugins: PluginInfo[] = [];

        // Process each line (skip the first line which is the count)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) {
                debug(`Line ${i} is empty, skipping`);
                continue;
            }

            debug(`\nProcessing line ${i}:`, line);

            try {
                // Extract plugin name (between quotes)
                const nameMatch = line.match(/"([^"]+)"/);
                if (!nameMatch) {
                    debug(`Line ${i}: No plugin name found`);
                    continue;
                }
                const name = nameMatch[1];
                debug(`Line ${i}: Found name:`, name);

                // Extract version (between first set of parentheses)
                const versionMatch = line.match(/\(([^)]+)\)/);
                if (!versionMatch) {
                    debug(`Line ${i}: No version found`);
                    continue;
                }
                const version = versionMatch[1];
                debug(`Line ${i}: Found version:`, version);

                // Extract author (between 'by' and the next parenthesis)
                const authorMatch = line.match(/by ([^(]+)/);
                if (!authorMatch) {
                    debug(`Line ${i}: No author found`);
                    continue;
                }
                const author = authorMatch[1].trim();
                debug(`Line ${i}: Found author:`, author);

                debug(`Line ${i}: Adding plugin:`, { name, version, author });
                plugins.push({ name, version, author });
            } catch (error) {
                debug(`Line ${i}: Failed to parse:`, error);
                console.warn('Failed to parse plugin line:', line, error);
                continue;
            }
        }

        debug('\nFinal plugin count:', plugins.length);
        debug('Plugins found:', plugins);

        // Validate that we found the expected number of plugins
        if (plugins.length !== totalPlugins) {
            debug('Plugin count mismatch:', { expected: totalPlugins, found: plugins.length });
            console.warn(`Plugin count mismatch. Expected: ${totalPlugins}, Found: ${plugins.length}`);
        }

        return {
            success: true,
            totalPlugins,
            plugins,
        };
    } catch (error) {
        debug('Fatal error in parser:', error);
        console.error('Error parsing plugin output:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error parsing plugin output',
        };
    }
}
