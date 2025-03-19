'use client';

import { useEffect } from 'react';
import { useAlertsStore } from '@/stores/Store.Alerts';
import { RwAlerts } from '@/db/schema';
import { ALERT_TABS } from './Alerts.Constants';
import { AlertContainer } from '@/components/ui/alerts/Alert.Container';
import { AlertHeader } from '@/components/ui/alerts/Alert.Header';
import { AlertContent } from '@/components/ui/alerts/Alert.Content';
import { archiveAlert, restoreAlert, resendAlertEmail } from './Alerts.Actions';
import { useQueryState } from 'nuqs';

interface AlertsContainerProps {
    initialAlerts: RwAlerts[];
}

export function AlertsContainer({ initialAlerts }: AlertsContainerProps) {
    const { alerts, setAlerts, activeTab, setActiveTab } = useAlertsStore();
    const [tab, setTab] = useQueryState('tab', { defaultValue: ALERT_TABS.CURRENT });

    useEffect(() => {
        setAlerts(initialAlerts);
    }, [initialAlerts, setAlerts]);

    useEffect(() => {
        setActiveTab(tab);
    }, [tab, setActiveTab]);

    const currentAlerts = alerts.filter((alert) => alert.active);
    const archivedAlerts = alerts.filter((alert) => !alert.active);
    const displayedAlerts = activeTab === ALERT_TABS.CURRENT ? currentAlerts : archivedAlerts;

    const handleArchive = async (alertId: number) => {
        await archiveAlert(alertId);
    };

    const handleRestore = async (alertId: number) => {
        await restoreAlert(alertId);
    };

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-primary_dark text-lg font-bold text-st_darkest md:w-4/5">
                <div className="w-full rounded-t-md bg-primary_dark text-lg font-bold text-st_darkest">
                    <div className="flex pt-1">
                        <button
                            onClick={() => setTab(ALERT_TABS.CURRENT)}
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === ALERT_TABS.CURRENT
                                    ? 'bg-st_darkest text-primary'
                                    : 'bg-primary text-st_darkest hover:bg-st_darkest hover:text-primary'
                            }`}
                        >
                            Current
                        </button>
                        <button
                            onClick={() => setTab(ALERT_TABS.HISTORY)}
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === ALERT_TABS.HISTORY
                                    ? 'bg-st_darkest text-primary'
                                    : 'bg-primary text-st_darkest hover:bg-st_darkest hover:text-primary'
                            }`}
                        >
                            History
                        </button>
                    </div>
                </div>

                <div className="flex h-fit w-full flex-col items-center p-4">
                    {displayedAlerts.map((alert) => (
                        <AlertContainer
                            key={alert.id}
                            alert={alert}
                            onArchive={activeTab === ALERT_TABS.CURRENT ? () => handleArchive(alert.id) : undefined}
                            onRestore={activeTab === ALERT_TABS.HISTORY ? () => handleRestore(alert.id) : undefined}
                            onResendEmail={() => resendAlertEmail(alert.id)}
                        >
                            <AlertHeader alert={alert} />
                            <AlertContent alert={alert} />
                        </AlertContainer>
                    ))}
                    {displayedAlerts.length === 0 && <div className="text-center text-gray-500">No alerts to display</div>}
                </div>
            </div>
        </div>
    );
}
