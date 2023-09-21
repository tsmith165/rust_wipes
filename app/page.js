export const metadata = {
  title: 'Rust Wipes - Recent Wipes',
  description: 'Keep track of the servers that just wiped so you can find a fresh server to play on!\n  We offer free auto-refresh, sound notifications, and filtering!',
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
