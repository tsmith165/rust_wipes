import PageLayout from '../src/components/layout/PageLayout'
import UpcomingWipesClass from '../src/components/UpcomingWipesClass';

// import { prisma } from '../lib/prisma'

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
    <PageLayout page_title={"Rust Wipes"}>
      <UpcomingWipesClass/>
    </PageLayout>
  )
}

/*
export default function Upcoming({server_list}) {
  return (
    <PageLayout page_title={"Rust Wipes"}>
      <UpcomingWipesClass server_list={server_list} fetch_servers={FetchServers}/>
    </PageLayout>
  )
}

async function FetchServers() {
  const use_test_vals = true
  var current_weekday = 5
  var current_day = 2
  var current_hour = 13

  console.log(`Current day of week: ${DAY_OF_WEEK_DICT[current_weekday]}`)
  
  if (use_test_vals == false) {
    const today = new Date()
    current_weekday = today.getDay()
    current_day = today.getDate()
    current_hour = today.getHours()
  }

  var force_wipe = false
  if ((current_weekday == 4) && (current_day < 8)) { // Day of week = 4 (Thursday) and date is within first week of the month
    force_wipe = true
  }

  var final_wipe_array = [];

  // Fetch Force Wipes
  if (force_wipe) {
      console.log(`Fetching force wipes with prisma`)
      const force_wipes = await prisma.server.findMany({
        orderBy: [
          {
            rank: 'asc',
          },
        ],
        where: {
            force_wipe_hour: {
                not: {
                    equals: null,
                }
            }
        },
    })
      final_wipe_array = force_wipes

  // Fetch Primary / Secondary wipes
  } else { 
      console.log(`Fetching primary/secondary wipes with prisma - Current WeekDay: ${current_weekday}`)
      const primary_wipes = await prisma.server.findMany({
          where: {
              primary_day: current_weekday,
          },
      })
      console.log(`Found primary wipes: ${primary_wipes}`)

      console.log(`Fetching secondary wipes with prisma - Current WeekDay: ${current_weekday}`)
      const secondary_wipes = await prisma.server.findMany({
          where: {
              secondary_day: current_weekday,
          },
      })
      console.log(`Found secondary wipes: ${secondary_wipes}`)

      final_wipe_array = primary_wipes
      secondary_wipes.forEach(wipe => { final_wipe_array.push(wipe) })
  }

  // Print found wipes and group wipes by wipe hour
  var grouped_wipe_dict = {}
  console.log(`Found wipes:`)
  final_wipe_array.forEach(wipe => {
    console.log(`ID: ${wipe.id} | Primary Wipe: ${wipe.primary_day}-${wipe.primary_hour} | Secondary Wipe: ${wipe.secondary_day}-${wipe.secondary_hour} | Force Wipe Hour: ${wipe.force_wipe_hour}`)
    if (force_wipe) {
      const wipe_data = {
        id: wipe['id'],
        rank: wipe['rank'],
        title: wipe['title'],
        wipe_hour: wipe['force_wipe_hour']
      }
      if (grouped_wipe_dict[wipe.force_wipe_hour] == undefined) { 
        grouped_wipe_dict[wipe.force_wipe_hour] = [wipe_data]
      } else {
        grouped_wipe_dict[wipe.force_wipe_hour].push(wipe_data)
      }
    } else {
      if (wipe.primary_day == current_weekday) {
        const wipe_data = {
          id: wipe['id'],
          rank: wipe['rank'],
          title: wipe['title'],
          wipe_hour: wipe['primary_hour']
        }
        if (grouped_wipe_dict[wipe.primary_hour] == undefined) { 
          grouped_wipe_dict[wipe.primary_hour] = [wipe_data]
        } else {
          grouped_wipe_dict[wipe.primary_hour].push(wipe_data)
        }
      } 
      else if (wipe.secondary_day == current_weekday) {
        const wipe_data = {
          id: wipe['id'],
          rank: wipe['rank'],
          title: wipe['title'],
          wipe_hour: wipe['secondary_hour']
        }
        if (grouped_wipe_dict[wipe.secondary_hour] == undefined) { 
          grouped_wipe_dict[wipe.secondary_hour] = [wipe_data]
        } else {
          grouped_wipe_dict[wipe.secondary_hour] = wipe_data
        }
      }
    }
  });

  return grouped_wipe_dict
}

export const getServerSideProps = async (context) => {
  console.log(`-------------- Fetching Server List --------------`)
  const server_list = await FetchServers()

  return {
      props: {
          "server_list": server_list
      }
  }
}
*/
