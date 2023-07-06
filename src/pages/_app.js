import Head from "next/head"
import "primeflex/primeflex.css"
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"
import "@/styles/styles.css"

export default function App({Component, pageProps}) {
    return <>
        <Head>
            <title>LJDP : Le Jeu Des Photos</title>
            <meta name="description" content="LJDP : Le Jeu Des Photos"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link rel="icon" href="/favicon.ico"/>
        </Head>
        <Component {...pageProps} />
    </>
}
