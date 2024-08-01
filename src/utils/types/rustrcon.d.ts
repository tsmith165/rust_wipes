declare module 'rustrcon' {
    export class Client {
        constructor(options: { ip: string; port: string; password: string });
        login(): void;
        send(message: string, name: string, identifier: number): void;
        destroy(): void;
        on(event: 'connected' | 'message' | 'error' | 'disconnect', listener: (data: any) => void): void;
    }
}
