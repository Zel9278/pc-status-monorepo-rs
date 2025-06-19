import { ReactNode } from "react"
import usageBarColor from "../Utils/usageBarColor"
import progressBarStyle from "../styles/Progress.module.css"

type Props = {
    children?: ReactNode
    value: number
    className?: string
}

const Progressbar = ({ children, value, className }: Props) => {
    return (
        <>
            <div className={`${progressBarStyle.progressBar} ${className}`}>
                <span
                    className={progressBarStyle.progressBarUsage}
                    style={{
                        width: `${value}%`,
                        backgroundColor: usageBarColor(value),
                    }}
                ></span>
            </div>
        </>
    )
}

export default Progressbar
