import { IconType } from 'react-icons';
import { Tooltip } from 'react-tooltip';

export type AlertControlButtonVariant = 'default' | 'error' | 'disabled';

const BUTTON_VARIANTS: Record<AlertControlButtonVariant, string> = {
    default: 'bg-stone-300 text-primary_light hover:bg-stone-500 hover:text-primary',
    error: 'bg-primary_light text-stone-950 hover:bg-primary_dark hover:text-stone-300',
    disabled: 'bg-stone-100 text-primary hover:bg-stone-300 hover:text-primary_dark',
};

interface AlertControlButtonProps {
    id: string;
    icon: IconType;
    tooltip: string;
    onClick?: () => void;
    variant?: AlertControlButtonVariant;
    disabled?: boolean;
}

export function AlertControlButton({ id, icon: Icon, tooltip, onClick, variant = 'default', disabled = false }: AlertControlButtonProps) {
    const buttonClass = `p-2 rounded-lg transition-colors ${BUTTON_VARIANTS[disabled ? 'disabled' : variant]}`;

    return (
        <>
            <button
                id={id}
                onClick={disabled ? undefined : onClick}
                className={buttonClass}
                disabled={disabled}
                data-tooltip-id={`tooltip-${id}`}
                data-tooltip-content={tooltip}
            >
                <Icon className="h-5 w-5" />
            </button>
            <Tooltip id={`tooltip-${id}`} />
        </>
    );
}
