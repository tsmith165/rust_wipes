export const metadata = {
    title: 'Rust Wipes - Server Details',
    description: 'Detailed information about the specific Rust server',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
  }
  
  import PageLayout from '@/components/layout/PageLayout';
  import ServerInfoPage from '@/components/pages/server/ServerInfoPage';
  
  export default function ServerPage() {
  
    return (
      <PageLayout page_title={"Server Details"} page={"server"}>
        <ServerInfoPage />
      </PageLayout>
    )
  }
  