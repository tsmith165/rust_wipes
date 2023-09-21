export const metadata = {
  title: 'Recent Wipes',
  description: 'Keep track of both Recent Rust Wipes as well as Upcoming Rust Wipes!',
  icons: {
      icon: '/rust_hazmat_icon.png',
  },
}

import PageLayout from '../components/layout/PageLayout'
import RecentWipesPage from '../components/pages/recent/RecentWipesPage';

export default async function Page({server_list, next_url, prev_url}) {
  return (
    <PageLayout page_title={"Recent Wipes"} page={"recent"}>
      <RecentWipesPage next_url={next_url} prev_url={prev_url}/>
    </PageLayout>
  )
}
