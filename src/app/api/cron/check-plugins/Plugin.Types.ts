export interface PluginInfo {
    name: string;
    version: string;
    author: string;
}

export interface PluginParseResult {
    success: boolean;
    totalPlugins?: number;
    plugins?: PluginInfo[];
    error?: string;
}

export interface PluginCheckResult {
    serverId: string;
    serverName: string | null;
    success: boolean;
    error?: string;
    plugins?: PluginInfo[];
}
