export const metadata = {
  title: 'Recent Wipes',
  description: 'Keep track of both Recent Rust Wipes as well as Upcoming Rust Wipes!',
  icons: {
      icon: '/rust_hazmat_icon.png',
  },
}

import PageLayout from '../components/layout/PageLayout'
import RecentWipesPage from '../components/pages/recent/RecentWipesPage';

export default async function Page() {
  return (
    <PageLayout page_title={"Recent Wipes"} page={"recent"}>
      <RecentWipesPage/>
    </PageLayout>
  )
}
