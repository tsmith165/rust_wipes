import PageLayout from '../../src/components/layout/PageLayout';
import ScraperStatsPage from '../../src/components/pages/scraper/stats/ScraperStatsPage';

export default function Stats({}) {
  return (
    <PageLayout page_title={"Scraper Stats"} page={"scraper"}>
      <ScraperStatsPage/>
    </PageLayout>
  )
}