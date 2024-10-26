'use client';

import { RwServer } from '@/db/schema';
import { useCountdown } from '@/hooks/useCountdown';

interface ServerInfoRowProps {
    label: string;
    value: string | number;
}

const ServerInfoRow = ({ label, value }: ServerInfoRowProps) => (
    <div className="flex flex-row space-x-2">
        <div className="w-[90px] font-bold text-stone-300">{label}:</div>
        <div className="text-stone-300">{value}</div>
    </div>
);

export function NextWipePanel({ server }: { server: RwServer }) {
    const countdown = useCountdown(server);

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
                <ServerInfoRow label="Group Size" value={server.group_size || 'N/A'} />
                <ServerInfoRow label="Drop Rate" value={server.rate} />
                <ServerInfoRow
                    label="Wipe Days"
                    value={server.wipe_days
                        .split(',')
                        .map((day) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][Number(day)])
                        .join(', ')}
                />
                <ServerInfoRow label="Wipe Time" value={`${server.wipe_time}:00AM PST`} />
            </div>
            <div className="rounded bg-gradient-to-b from-stone-500 to-stone-300 p-3">
                <p className="text-lg font-semibold">Next Wipe In:</p>
                <p className="text-2xl font-bold text-primary_light">{countdown}</p>
            </div>
        </div>
    );
}
