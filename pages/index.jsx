import PageLayout from '../src/components/layout/PageLayout'
import ServerListClass from '../src/components/ServerListClass';

import { fetch_battlemetrics_servers } from '../lib/api_calls'

export default function Home({server_list, next_url, prev_url}) {
  return (
    <PageLayout page_title={"Recent Wipes"} page={"recent"}>
      <ServerListClass server_list={server_list} next_url={next_url} prev_url={prev_url}/>
    </PageLayout>
  )
}

/*
export const getServerSideProps = async (context) => {
  console.log("Getting Server Side Props")
  const [new_server_list, next_url, prev_url] = await fetch_battlemetrics_servers('US', 5000, 2, 25, '', '', true, true)

  //console.log(context)
  return { 
      props: {
          "server_list": new_server_list,
          "next_url": next_url,
          "prev_url": prev_url
      }
  }
}
*/
