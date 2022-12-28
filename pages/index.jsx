import PageLayout from '../src/components/layout/PageLayout'
import RecentWipesPage from '../src/components/pages/recent/RecentWipesPage';

export default function Home({server_list, next_url, prev_url}) {
  return (
    <PageLayout page_title={"Recent Wipes"} page={"recent"}>
      <RecentWipesPage next_url={next_url} prev_url={prev_url}/>
    </PageLayout>
  )
}
