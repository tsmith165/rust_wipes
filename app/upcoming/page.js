export const metadata = {
  title: 'Rust Wipes - Upcoming Wipes',
  description: 'See what wipes are coming up soon so you can plan your day!',
  icons: {
      icon: '/rust_hazmat_icon.png',
  },
}

import PageLayout from '../../components/layout/PageLayout'
import UpcomingWipesPage from '../../components/pages/upcoming/UpcomingWipesPage';

const DAY_OF_WEEK_DICT = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

export default async function Page() {
  return (
    <PageLayout page_title={"Upcoming Wipes"} page={"upcoming"}>
      <UpcomingWipesPage/>
    </PageLayout>
  )
}
