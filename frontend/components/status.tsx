import { Fragment, ReactNode, useEffect, useState } from "react"
import Image from "next/image"
import { ClientData } from "../types/client"
import { useRouter } from "next/router"
import selectIcon from "../Utils/selectIcon"
import { getPercent, getCPUPercent } from "../Utils/getPercent"
import Progressbar from "./ProgressBar"

type Props = {
    children?: ReactNode
    status: ClientData
    pc: string
    onFocusClick?: () => void
}

const Status = ({ children, status, pc, onFocusClick }: Props) => {
    const [hash, setHash] = useState({})
    const { isReady } = useRouter()
    const pcData = (status || {})[pc]
    const cpuPercent = getCPUPercent(pcData.cpu.cpus)
    const ramPercent = getPercent(pcData.ram.free, pcData.ram.total)
    const storages = pcData.storages
    const storagePercent = getPercent(
        storages.at(0)!.free,
        storages.at(0)!.total
    )

    useEffect(() => {
        if (isReady) {
            const hashData = decodeURI(location.hash.replace(/#/, ""))
            const border =
                hashData === pcData?.hostname
                    ? {
                          border: "solid",
                      }
                    : {}
            setHash(border)
        }
    }, [isReady, pcData?.hostname])

    useEffect(() => {
        addEventListener("hashchange", (e) => {
            const hashData = decodeURI(location.hash.replace(/#/, ""))
            const border =
                hashData === pcData?.hostname
                    ? {
                          border: "solid",
                      }
                    : {}
            setHash(border)
        })
    }, [pcData?.hostname])

    return (
        <Fragment key={pc}>
            <div
                className={"card bg-base-60 shadow-xl height-5 text-center"}
                id={pcData?.hostname}
                style={hash}
            >
                <div className="card-body">
                    <div className="avatar center">
                        <div className="w-12">
                            <Image
                                src={selectIcon(pcData?._os)}
                                alt={`${pcData?._os} icon`}
                                width={48}
                                height={48}
                            />
                        </div>
                    </div>
                    <h2 className="card-title flex justify-between">
                        {pcData?.hostname}
                        <button
                            onClick={onFocusClick}
                            className="btn border-none bg-base-50 bg-transparent"
                        >
                            Focus
                        </button>
                    </h2>

                    <div>
                        <p>used version: {pcData.version}</p>
                    </div>

                    <div className="stats shadow">
                        <div className="stat">
                            <div className="stat-figure text-secondary"></div>
                            <div className="stat-title">CPU</div>
                            <div className="stat-value">{cpuPercent}%</div>
                            <div className="stat-desc">
                                <Progressbar
                                    value={cpuPercent}
                                    className="w-20 mx-auto my-0"
                                />
                            </div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-secondary"></div>
                            <div className="stat-title">RAM</div>
                            <div className="stat-value">{ramPercent}%</div>
                            <div className="stat-desc">
                                <Progressbar
                                    value={ramPercent}
                                    className="w-20 mx-auto my-0"
                                />
                            </div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-secondary"></div>
                            <div className="stat-title">Storage</div>
                            <div className="stat-value">{storagePercent}%</div>
                            <div className="stat-desc">
                                <Progressbar
                                    value={storagePercent}
                                    className="w-20 mx-auto my-0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-secondary"></div>
                        <div className="stat-title">GPU</div>
                        <div className="stat-value">
                            {(status || {})[pc]?.gpus && (status || {})[pc]?.gpus.length > 0 ? (
                                (() => {
                                    const gpus = (status || {})[pc]?.gpus;
                                    // 使用率が取得可能な最初のGPUを探す
                                    const validGpu = gpus.find(gpu =>
                                        !(gpu.name.toLowerCase().includes('intel') && gpu.usage === 0)
                                    );

                                    if (validGpu) {
                                        return (
                                            <>
                                                {Math.floor(validGpu.usage)}%
                                                <span className="text-sm ml-1">({gpus.length})</span>
                                            </>
                                        );
                                    } else {
                                        // すべてのGPUがIntel（使用率取得不可）の場合
                                        return (
                                            <>
                                                N/A
                                                <span className="text-sm ml-1">({gpus.length})</span>
                                            </>
                                        );
                                    }
                                })()
                            ) : (
                                <>NaN%</>
                            )}
                        </div>
                        <div className="stat-desc">
                            {(status || {})[pc]?.gpus && (status || {})[pc]?.gpus.length > 0 ? (
                                (() => {
                                    const gpus = (status || {})[pc]?.gpus;
                                    // 使用率が取得可能な最初のGPUを探す
                                    const validGpu = gpus.find(gpu =>
                                        !(gpu.name.toLowerCase().includes('intel') && gpu.usage === 0)
                                    );

                                    if (validGpu) {
                                        return (
                                            <div className="h-6 flex items-center justify-center">
                                                <Progressbar
                                                    value={validGpu.usage}
                                                    className="w-20 mx-auto my-0"
                                                />
                                            </div>
                                        );
                                    } else {
                                        // すべてのGPUがIntel（使用率取得不可）の場合は名前を表示
                                        return (
                                            <div className="h-6 flex items-center justify-center">
                                                <div className="text-xs text-gray-500 truncate max-w-20">
                                                    {gpus[0].name}
                                                </div>
                                            </div>
                                        );
                                    }
                                })()
                            ) : (
                                <div className="h-6 flex items-center justify-center">
                                    <Progressbar
                                        value={0}
                                        className="w-20 mx-auto my-0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Status
