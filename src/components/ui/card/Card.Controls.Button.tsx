import { IconType } from 'react-icons';
import { Tooltip } from 'react-tooltip';
import Link from 'next/link';

export type CardControlButtonVariant = 'default' | 'warning' | 'error' | 'disabled';

const BUTTON_VARIANTS: Record<CardControlButtonVariant, string> = {
    default: 'bg-stone-300 text-primary_light hover:bg-stone-500 hover:text-primary',
    warning: 'bg-yellow-500 text-stone-950 hover:bg-yellow-600 hover:text-stone-300',
    error: 'bg-primary_light text-stone-950 hover:bg-primary_dark hover:text-stone-300',
    disabled: 'bg-stone-100 text-primary hover:bg-stone-300 hover:text-primary_dark',
};

interface CardControlButtonProps {
    id: string;
    icon: IconType;
    tooltip: string;
    onClick?: () => void;
    variant?: CardControlButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    href?: string;
    isExternal?: boolean;
}

export function CardControlButton({
    id,
    icon: Icon,
    tooltip,
    onClick,
    variant = 'default',
    disabled = false,
    loading = false,
    href,
    isExternal = false,
}: CardControlButtonProps) {
    const buttonClass = `p-2 rounded-lg transition-colors ${BUTTON_VARIANTS[disabled || loading ? 'disabled' : variant]}`;

    const buttonContent = (
        <>
            <Icon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </>
    );

    if (href) {
        return (
            <>
                <Link
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className={buttonClass}
                    data-tooltip-id={`tooltip-${id}`}
                    data-tooltip-content={loading ? 'Processing...' : tooltip}
                >
                    {buttonContent}
                </Link>
                <Tooltip id={`tooltip-${id}`} />
            </>
        );
    }

    return (
        <>
            <button
                id={id}
                onClick={disabled || loading ? undefined : onClick}
                className={buttonClass}
                disabled={disabled || loading}
                data-tooltip-id={`tooltip-${id}`}
                data-tooltip-content={loading ? 'Processing...' : tooltip}
            >
                {buttonContent}
            </button>
            <Tooltip id={`tooltip-${id}`} />
        </>
    );
}
