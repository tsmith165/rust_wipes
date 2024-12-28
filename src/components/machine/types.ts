export interface MachineContainerProps {
    children: React.ReactNode;
    leftCharacterImage?: string;
    rightCharacterImage?: string;
}

export interface MachineCharacterProps {
    imagePath: string;
    position: 'left' | 'right';
}

export interface MachineGameContainerProps {
    children: React.ReactNode;
}

export interface MachineBackgroundProps {
    // Add any background-specific props here if needed in the future
}

export interface MachineControlsProps {
    children: React.ReactNode;
}

export interface MachineControlsUserProps {
    steamProfile?: {
        name: string;
        avatarUrl: string;
        steamId: string;
    } | null;
    credits: number | null;
    steamInput: string;
}
