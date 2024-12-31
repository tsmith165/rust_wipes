import PageLayout from '@/components/layout/PageLayout';
import RustySlotsContainer from './RustySlots.Container';

export const metadata = {
    title: 'Rust Slots | Default Machine',
    description: 'Play the default Rust-themed slot machine and win big!',
};

export default function RustySlotsPage() {
    return (
        <PageLayout page="/games/rusty-slots">
            <RustySlotsContainer />
        </PageLayout>
    );
}
