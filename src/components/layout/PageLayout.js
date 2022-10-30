import Head from 'next/head'
import styles from "../../../styles/layout/PageLayout.module.scss"

const PageLayout = ({page_title="Rust Wipes", page="recent", children}) => {
    console.log(`-------------------------------------------------------`)
    console.log(`Page Title: ${page_title} | Page: ${page}`)
    console.log('Children (NEXT LINE):')
    console.log(children)

    return (
        <div className={styles.container}>
            <Head>
                <title>{page_title}</title>
                <meta name="description" content="Rust Wipes" />
                <link rel="icon" href="/rust_hazmat_icon.png" />
            </Head>
            
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}

export default PageLayout;

