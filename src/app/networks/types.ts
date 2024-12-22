export interface ParsedServer {
    id: number;
    title: string | null;
    bm_id: string;
}

export interface ServerDetails extends ParsedServer {
    current_pop?: number | null;
    max_pop?: number | null;
    last_wipe?: Date | null;
    next_wipe?: Date | null;
    isLoading?: boolean;
}

export interface ServerNetwork {
    id: number;
    name: string | null;
    region: string | null;
    bm_ids: string | null;
    servers: ServerDetails[];
}
