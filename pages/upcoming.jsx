import PageLayout from '../src/components/layout/PageLayout'
import UpcomingWipesPage from '../src/components/pages/upcoming/UpcomingWipesPage';

const DAY_OF_WEEK_DICT = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

export default function Upcoming({server_list}) {
  return (
    <PageLayout page_title={"Upcoming Wipes"} page={"upcoming"}>
      <UpcomingWipesPage/>
    </PageLayout>
  )
}
