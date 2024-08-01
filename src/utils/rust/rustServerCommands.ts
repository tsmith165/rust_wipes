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
            resolve(message);
        });

        rcon.on('error', (error: Error) => {
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

async function sendCommandToAllServers(command: string): Promise<void> {
    const serverConfigs = getServerConfigs();
    const results = await Promise.allSettled(serverConfigs.map((config) => sendCommandToRustServer(command, config)));

    results.forEach((result, index) => {
        const serverName = serverConfigs[index].name;
        if (result.status === 'fulfilled') {
            console.log(`Command executed successfully on ${serverName}`);
        } else {
            console.error(`Failed to execute command on ${serverName}:`, result.reason);
        }
    });
}

export async function grantKitAccess(steamId: string, kitName: string): Promise<void> {
    const command = `oxide.grant user ${steamId} kits.${kitName.toLowerCase()}`;
    console.log(`Granting access for Steam ID: ${steamId} to kit: ${kitName}`);
    await sendCommandToAllServers(command);
}

export async function revokeKitAccess(steamId: string, kitName: string): Promise<void> {
    const command = `oxide.revoke user ${steamId} kits.${kitName.toLowerCase()}`;
    console.log(`Revoking access for Steam ID: ${steamId} from kit: ${kitName}`);
    await sendCommandToAllServers(command);
}
