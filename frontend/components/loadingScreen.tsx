import { ReactNode } from "react"
import styles from "../styles/Loading.module.css"

type Props = {
    children?: ReactNode
    type?: string
}

const LoadingScreen = ({ children, type }: Props) => {
    if (type === "loading") {
        return (
            <div className={styles.loading}>
                <ul className="steps">
                    <li className="step step-primary">Loading</li>
                    <li className="step">Connecting</li>
                    <progress
                        className="progress progress-info w-0 hidden"
                        value="50"
                        max="100"
                    ></progress>
                    <progress
                        className="progress progress-warning w-0 hidden"
                        value="50"
                        max="100"
                    ></progress>
                    <progress
                        className="progress progress-error w-0 hidden"
                        value="50"
                        max="100"
                    ></progress>
                </ul>
            </div>
        )
    }

    if (type === "connecting") {
        return (
            <div className={styles.loading}>
                <ul className="steps">
                    <li className="step step-primary">Loading</li>
                    <li className="step step-primary">Connecting</li>
                </ul>
            </div>
        )
    }

    if (type === "error") {
        return (
            <div className={styles.loading}>
                <ul className="steps">
                    <li className="step step-primary">Loading</li>
                    <li className="step step-primary">Connecting</li>
                    <li className="step step-error">Error</li>
                </ul>
                <div className="alert alert-error mt-4">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Connection failed. Please check your server connection.</span>
                    </div>
                </div>
            </div>
        )
    }

    return <></>
}

export default LoadingScreen
