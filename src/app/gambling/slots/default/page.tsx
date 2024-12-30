import { DefaultSlotContainer } from './Default.Container';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Rust Slots | Default Machine',
    description: 'Play the default Rust-themed slot machine and win big!',
};

export default function DefaultSlotPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-stone-900 p-4">
            <DefaultSlotContainer />
        </main>
    );
}
