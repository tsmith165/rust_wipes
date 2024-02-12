export const metadata = {
    title: 'Scrapper Stats',
    description: 'Display stats on run time and servers parsed by the scrapper.',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import PageLayout from '@/components/layout/PageLayout';
import ScrapperStatsPage from '@/components/pages/scrapper/stats/ScraperStatsPage';

export default async function Page() {
    return (
        <PageLayout page_title={'Scrapper Stats'} page={'scrapper'}>
            <ScrapperStatsPage />
        </PageLayout>
    );
}