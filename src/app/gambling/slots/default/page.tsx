import PageLayout from '@/components/layout/PageLayout';
import { DefaultSlotContainer } from './Default.Container';

export const metadata = {
    title: 'Rust Slots | Default Machine',
    description: 'Play the default Rust-themed slot machine and win big!',
};

export default function DefaultSlotPage() {
    return (
        <PageLayout page="/gambling/slots/default">
            <DefaultSlotContainer />
        </PageLayout>
    );
}
