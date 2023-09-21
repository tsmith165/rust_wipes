export const metadata = {
  title: 'Upcoming Wipes',
  description: 'Keep track of both Recent Rust Wipes as well as Upcoming Rust Wipes!',
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

export default async function Page({server_list}) {
  return (
    <PageLayout page_title={"Upcoming Wipes"} page={"upcoming"}>
      <UpcomingWipesPage/>
    </PageLayout>
  )
}
