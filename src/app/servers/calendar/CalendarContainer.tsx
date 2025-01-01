'use client';

import { RwServer, NextWipeInfo } from '@/db/schema';
import { CalendarDesktop } from './CalendarDesktop';
import { CalendarMobile } from './CalendarMobile';

interface CalendarContainerProps {
    servers: RwServer[];
    nextWipeInfoMap: Record<string, NextWipeInfo>;
}

export function CalendarContainer({ servers, nextWipeInfoMap }: CalendarContainerProps) {
    return (
        <>
            <div className="hidden md:block">
                <CalendarDesktop servers={servers} nextWipeInfoMap={nextWipeInfoMap} />
            </div>
            <div className="block md:hidden">
                <CalendarMobile servers={servers} nextWipeInfoMap={nextWipeInfoMap} />
            </div>
        </>
    );
}
