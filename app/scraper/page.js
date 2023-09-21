export const metadata = {
  title: 'Scraper Stats',
  description: 'Display stats on run time and servers parsed by the scraper.',
  icons: {
      icon: '/rust_hazmat_icon.png',
  },
}

import PageLayout from '../../components/layout/PageLayout';
import ScraperStatsPage from '../../components/pages/scraper/stats/ScraperStatsPage';

export default async function Page() {
  return (
    <PageLayout page_title={"Scraper Stats"} page={"scraper"}>
      <ScraperStatsPage/>
    </PageLayout>
  )
}