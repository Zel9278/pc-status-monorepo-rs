import Head from "next/head"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import styles from "../../styles/FocusPage.module.css"
import io from "socket.io-client"

const FocusPage: NextPage = () => {
    const { query, isReady } = useRouter()
    const { hostname } = query
    return (
        <>
            <Head>
                <title>PC Status - {hostname}</title>
                <meta name="description" content="PC Status" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <h1>Hello World, {hostname}!</h1>
            </main>
        </>
    )
}

export default FocusPage
