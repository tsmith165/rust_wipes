import PageLayout from '../src/components/layout/PageLayout'
import ServerListClass from '../src/components/ServerListClass';

export default function Home({}) {
  return (
    <PageLayout page_title={"Recent Wipes"}>
      <ServerListClass/>
    </PageLayout>
  )
}

/*
export const getStaticProps = async (context) => {
  console.log("Getting Static Props")
  const fetched_server_list = await fetchServers(25)

  //console.log(context)
  return { 
      props: {
          "fetched_server_list": fetched_server_list
      },
      revalidate: 60
  }
}
*/
