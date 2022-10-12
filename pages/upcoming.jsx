import PageLayout from '../src/components/layout/PageLayout'
import UpcomingWipesClass from '../src/components/UpcomingWipesClass';

import { fetch_upcoming_servers_for_week_day } from '../lib/api_calls'

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
    <PageLayout page_title={"Upcoming Wipes"}>
      <UpcomingWipesClass server_list={server_list}/>
    </PageLayout>
  )
}

export const getServerSideProps = async (context) => {
  console.log(`-------------- Fetching Server List --------------`)
  const cur_date = new Date()
  const server_list = await fetch_upcoming_servers_for_week_day(cur_date.getDay() + 1, -7, 5000, true)
  
  return {
      props: {
          "server_list": server_list
      }
  }
}
