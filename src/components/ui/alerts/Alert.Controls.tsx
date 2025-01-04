import { RwAlerts } from '@/db/schema';
import { AlertControlButton } from './Alert.Controls.Button';
import { HiArchive, HiRefresh } from 'react-icons/hi';
import { MdEmail } from 'react-icons/md';

interface AlertControlsProps {
    alert: RwAlerts;
    onArchive?: () => void;
    onRestore?: () => void;
    onResendEmail?: () => void;
}

export function AlertControls({ alert, onArchive, onRestore, onResendEmail }: AlertControlsProps) {
    return (
        <div className="mt-4 flex justify-start space-x-2">
            {onResendEmail && (
                <AlertControlButton
                    id={`resend-${alert.id}`}
                    icon={MdEmail}
                    tooltip="Resend Email"
                    onClick={onResendEmail}
                    variant={alert.sent ? 'default' : 'error'}
                    disabled={!alert.active}
                />
            )}
            {alert.active && onArchive && (
                <AlertControlButton
                    id={`archive-${alert.id}`}
                    icon={HiArchive}
                    tooltip="Archive Alert"
                    onClick={onArchive}
                    variant="default"
                />
            )}
            {!alert.active && onRestore && (
                <AlertControlButton
                    id={`restore-${alert.id}`}
                    icon={HiRefresh}
                    tooltip="Restore Alert"
                    onClick={onRestore}
                    variant="default"
                />
            )}
        </div>
    );
}
