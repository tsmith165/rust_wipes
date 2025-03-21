import { Client } from 'rustrcon';

interface ServerConfig {
    name: string;
    ip: string;
    port: number;
    password: string;
}

const RUST_SERVER_CONNECTION_DETAILS = process.env.RUST_SERVER_CONNECTION_DETAILS;

export function getServerConfigs(): ServerConfig[] {
    if (!RUST_SERVER_CONNECTION_DETAILS) {
        throw new Error('RUST_SERVER_CONNECTION_DETAILS environment variable is not set');
    }
    console.log('RUST_SERVER_CONNECTION_DETAILS:', RUST_SERVER_CONNECTION_DETAILS);

    try {
        const parsedData: string[][] = JSON.parse(RUST_SERVER_CONNECTION_DETAILS);
        return parsedData.map(([name, ip, port, password]) => ({
            name,
            ip,
            port: parseInt(port, 10),
            password,
        }));
    } catch (error) {
        console.error('Failed to parse RUST_SERVER_CONNECTION_DETAILS:', error);
        throw error;
    }
}

async function sendCommandToRustServer(command: string, config: ServerConfig): Promise<string> {
    console.log(`Connecting to Rust server ${config.name} (${config.ip}:${config.port})`);

    const rcon = new Client({
        ip: config.ip,
        port: config.port.toString(),
        password: config.password,
    });

    return new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
            rcon.destroy();
            reject(new Error(`Timeout connecting to ${config.name}`));
        }, 30000); // 30 seconds timeout

        rcon.on('connected', () => {
            console.log(`Connected to ${config.name}`);
            console.log(`Sending command: ${command}`);
            rcon.send(command, 'RustWipes', 1);
        });

        rcon.on('message', (message: string) => {
            console.log(`Response from ${config.name}:`, message);
            clearTimeout(timeout);
            rcon.destroy();
            resolve(JSON.stringify(message));
        });

        rcon.on('error', (error: string) => {
            console.error(`Error on ${config.name}:`, error);
            clearTimeout(timeout);
            rcon.destroy();
            reject(error);
        });

        rcon.on('disconnect', () => {
            console.log(`Disconnected from ${config.name}`);
        });

        rcon.login();
    });
}

async function sendCommandToSingleServer(
    command: string,
    serverConfig: ServerConfig,
): Promise<{ serverName: string; response: string; success: boolean; command: string }> {
    try {
        const response = await sendCommandToRustServer(command, serverConfig);
        const success = isCommandSuccessful(response);
        console.log(`Command executed on ${serverConfig.name}. Success: ${success}`);
        return { serverName: serverConfig.name, response, success, command };
    } catch (error) {
        console.error(`Failed to execute command on ${serverConfig.name}:`, error);
        return {
            serverName: serverConfig.name,
            response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false,
            command,
        };
    }
}

async function sendCommandToAllServers(
    command: string,
): Promise<{ serverName: string; response: string; success: boolean; command: string }[]> {
    const serverConfigs = getServerConfigs();
    const results = await Promise.allSettled(serverConfigs.map((config) => sendCommandToRustServer(command, config)));

    return results.map((result, index) => {
        const serverName = serverConfigs[index].name;
        if (result.status === 'fulfilled') {
            const success = isCommandSuccessful(result.value);
            console.log(`Command executed on ${serverName}. Success: ${success}`);
            return { serverName, response: result.value, success, command };
        } else {
            console.error(`Failed to execute command on ${serverName}:`, result.reason);
            return { serverName, response: `Error: ${result.reason.message}`, success: false, command };
        }
    });
}

function isCommandSuccessful(response: string): boolean {
    try {
        const parsedResponse = JSON.parse(response);
        // Check if the response is empty (usually indicates success for grant/revoke commands)
        if (parsedResponse.content.trim() === '') {
            return true;
        }
        // Check for specific error messages
        if (
            parsedResponse.content.includes("doesn't exist") ||
            parsedResponse.content.includes('does not have') ||
            parsedResponse.content.includes('failed') ||
            parsedResponse.content.includes('error')
        ) {
            return false;
        }
        // If none of the above, assume success
        return true;
    } catch (error) {
        console.error('Error parsing response:', error);
        return false;
    }
}

// Existing exports for backwards compatibility
export async function grantKitAccess(
    steamId: string,
    kitName: string,
    permissionString: string,
): Promise<{
    success: boolean;
    message: string;
    serverResults: { serverName: string; response: string; success: boolean; command: string }[];
}> {
    const command = `oxide.grant user ${steamId} ${permissionString}`;
    console.log(`Granting access for Steam ID: ${steamId} to kit: ${kitName}`);
    const results = await sendCommandToAllServers(command);

    const allSuccessful = results.every((result) => result.success);
    const successfulServers = results.filter((result) => result.success).map((result) => result.serverName);
    const failedServers = results.filter((result) => !result.success).map((result) => result.serverName);

    if (allSuccessful) {
        return {
            success: true,
            message: `Successfully granted access to kit ${kitName} for Steam ID ${steamId} on all servers.`,
            serverResults: results,
        };
    } else if (successfulServers.length > 0) {
        return {
            success: true,
            message: `Partially successful. Granted access on servers: ${successfulServers.join(', ')}. Failed on servers: ${failedServers.join(', ')}.`,
            serverResults: results,
        };
    } else {
        return {
            success: false,
            message: `Failed to grant access on all servers: ${failedServers.join(', ')}.`,
            serverResults: results,
        };
    }
}

export async function revokeKitAccess(
    steamId: string,
    kitName: string,
): Promise<{
    success: boolean;
    message: string;
    serverResults: { serverName: string; response: string; success: boolean; command: string }[];
}> {
    const command = `oxide.revoke user ${steamId} kits.${kitName.toLowerCase()}`;
    console.log(`Revoking access for Steam ID: ${steamId} from kit: ${kitName}`);
    const results = await sendCommandToAllServers(command);

    const allSuccessful = results.every((result) => result.success);
    const successfulServers = results.filter((result) => result.success).map((result) => result.serverName);
    const failedServers = results.filter((result) => !result.success).map((result) => result.serverName);

    if (allSuccessful) {
        return {
            success: true,
            message: `Successfully revoked access to kit ${kitName} for Steam ID ${steamId} on all servers.`,
            serverResults: results,
        };
    } else if (successfulServers.length > 0) {
        return {
            success: true,
            message: `Partially successful. Revoked access on servers: ${successfulServers.join(', ')}. Failed on servers: ${failedServers.join(', ')}.`,
            serverResults: results,
        };
    } else {
        return {
            success: false,
            message: `Failed to revoke access on all servers: ${failedServers.join(', ')}.`,
            serverResults: results,
        };
    }
}

// New server management commands
export async function sendServerCommand(
    serverId: string,
    command: string,
    serverConfig: ServerConfig,
): Promise<{
    success: boolean;
    message: string;
    serverResults: { serverName: string; response: string; success: boolean; command: string }[];
}> {
    console.log(`Sending command '${command}' to server ${serverId}`);

    const result = await sendCommandToSingleServer(command, serverConfig);
    const serverResults = [result];

    if (result.success) {
        return {
            success: true,
            message: `Successfully executed command on server ${serverId}`,
            serverResults,
        };
    } else {
        return {
            success: false,
            message: `Failed to execute command on server ${serverId}: ${result.response}`,
            serverResults,
        };
    }
}

export async function restartServer(
    serverId: string,
    serverConfig: ServerConfig,
): Promise<{
    success: boolean;
    message: string;
    serverResults: { serverName: string; response: string; success: boolean; command: string }[];
}> {
    return sendServerCommand(serverId, 'servermanager.testrestart', serverConfig);
}

export async function regularWipe(
    serverId: string,
    serverConfig: ServerConfig,
): Promise<{
    success: boolean;
    message: string;
    serverResults: { serverName: string; response: string; success: boolean; command: string }[];
}> {
    return sendServerCommand(serverId, 'servermanager.wipe regular immediate', serverConfig);
}

export async function bpWipe(
    serverId: string,
    serverConfig: ServerConfig,
): Promise<{
    success: boolean;
    message: string;
    serverResults: { serverName: string; response: string; success: boolean; command: string }[];
}> {
    return sendServerCommand(serverId, 'servermanager.wipe bp immediate', serverConfig);
}
