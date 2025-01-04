import { create } from 'zustand';
import { RwAlerts } from '@/db/schema';
import { ALERT_TABS } from '@/app/admin/alerts/Alerts.Constants';

interface AlertsStore {
    alerts: RwAlerts[];
    activeTab: string;
    setAlerts: (alerts: RwAlerts[]) => void;
    setActiveTab: (tab: string) => void;
    addAlert: (alert: RwAlerts) => void;
    updateAlert: (alert: RwAlerts) => void;
    removeAlert: (alertId: number) => void;
}

export const useAlertsStore = create<AlertsStore>((set) => ({
    alerts: [],
    activeTab: ALERT_TABS.CURRENT,
    setAlerts: (alerts) => set({ alerts }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
    updateAlert: (alert) =>
        set((state) => ({
            alerts: state.alerts.map((a) => (a.id === alert.id ? alert : a)),
        })),
    removeAlert: (alertId) =>
        set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== alertId),
        })),
}));
