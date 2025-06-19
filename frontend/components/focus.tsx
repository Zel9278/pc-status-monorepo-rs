import { ReactNode, useEffect, useRef, useState, createRef } from "react"
import Image from "next/image"
import { ClientData } from "../types/client"
import { byteToData } from "../Utils/byteToData"
import selectIcon from "../Utils/selectIcon"
import { getCPUPercent, getPercent } from "../Utils/getPercent"
import { formatUptime } from "../Utils/formatUptime"
import Progressbar from "./ProgressBar"
import CanvasChart from "./CanvasChart"

type Props = {
    children?: ReactNode
    status: ClientData
    pc: string
    onClose?: () => void
}

const Focus = ({ children, status, pc, onClose }: Props) => {
    const pcStatus = (status || {})[pc]
    const cpuPercent = getCPUPercent(pcStatus.cpu.cpus)
    const ramPercent = getPercent(pcStatus.ram.free, pcStatus.ram.total)
    let swapPercent = 0
    if (pcStatus.swap)
        swapPercent = getPercent(pcStatus.swap.free, pcStatus.swap.total)
    const storages = pcStatus.storages
    let gpuMemPercent = 0
    if (pcStatus.gpu)
        gpuMemPercent = getPercent(
            pcStatus.gpu.memory.free,
            pcStatus.gpu.memory.total
        )

    // Canvas chart configuration
    const chartConfig = {
        height: 250,
        minY: 0,
        maxY: 100,
        xAxisLabel: "Time",
        yAxisLabel: "Usage (%)"
    }

    // CPU chart data
    const cpuHistory = pcStatus.histories.map((history) => history.cpu.cpus)
    const cpuDatasets = cpuHistory.length > 0 ? cpuHistory[0].map((_, coreIndex) => ({
        label: `Core${coreIndex}`,
        data: cpuHistory.map((history) => history[coreIndex]?.cpu || 0),
        color: `hsl(${coreIndex * 60}, 70%, 50%)`
    })) : []

    // Memory chart data
    const ramHistory = pcStatus.histories.map((history) => history.ram)
    const swapHistory = pcStatus.histories.map((history) => history.swap)
    const memoryDatasets = [
        {
            label: "RAM",
            data: ramHistory.map((ram) => getPercent(ram.free, ram.total)),
            color: "#10b981"
        },
        {
            label: "Swap",
            data: swapHistory.map((swap) => getPercent(swap.free, swap.total)),
            color: "#f59e0b"
        }
    ]

    // Storage chart data
    const storageHistory = pcStatus.histories.map((history) => history.storages)
    const storageDatasets = storageHistory.length > 0 && storageHistory[0].length > 0
        ? storageHistory[0].map((storage, storageIndex) => ({
            label: storage.name || `Storage${storageIndex}`,
            data: storageHistory.map((history) =>
                history[storageIndex] ? getPercent(history[storageIndex].free, history[storageIndex].total) : 0
            ),
            color: `hsl(${storageIndex * 120}, 60%, 50%)`
        })) : []

    // GPU chart data
    const gpuHistory = pcStatus.gpu ? pcStatus.histories.map((history) => history.gpu) : []
    const gpuDatasets = pcStatus.gpu ? [
        {
            label: "GPU Usage",
            data: gpuHistory.map((gpu) => gpu?.usage || 0),
            color: "#ef4444"
        },
        {
            label: "GPU Memory",
            data: gpuHistory.map((gpu) =>
                gpu ? getPercent(gpu.memory.free, gpu.memory.total) : 0
            ),
            color: "#3b82f6"
        }
    ] : []

    // ESCキーでFocusを閉じる
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between sticky backdrop-blur-sm shadow-lg py-2 px-5 top-0 z-50 bg-base-100">
                    <h2 className="text-lg font-semibold">
                        Focus - {pcStatus?.hostname}
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle border-none w-8 bg-base-50 bg-transparent"
                    >
                        ✕
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
                    <div className="statusBody px-6 py-3">
                        <div className="flex items-center">
                            <div className="avatar center">
                                <div className="w-12">
                                    <Image
                                        src={selectIcon(pcStatus?._os)}
                                        alt={`${pcStatus?._os} icon`}
                                        width={48}
                                        height={48}
                                    />
                                </div>
                            </div>
                            <p className="px-2">{pcStatus._os}</p>
                        </div>

                        <div className="bg-slate-700 w-full h-0.5 rounded my-2" />
                        <p>CPU: {pcStatus?.cpu.model}</p>
                        <div className="flex items-center">
                            <p>All:</p>
                            <Progressbar
                                value={cpuPercent}
                                className="w-full mx-3"
                            />
                            <p>{Math.floor(cpuPercent)}%</p>
                        </div>
                        <ul>
                            {pcStatus?.cpu.cpus.map((cpu, i) => {
                                return (
                                    <li key={i} className="flex items-center">
                                        <p>Core{i}:</p>
                                        <Progressbar
                                            value={cpu.cpu}
                                            className="w-full mx-3"
                                        />
                                        <p>{Math.floor(cpu.cpu)}%</p>
                                    </li>
                                )
                            })}
                        </ul>
                        <CanvasChart
                            {...chartConfig}
                            datasets={cpuDatasets}
                            title="CPU Usage"
                        />
                        <div className="bg-slate-700 w-full h-0.5 rounded my-2" />
                        <p>
                            RAM:{" "}
                            {byteToData(
                                pcStatus?.ram.total - pcStatus?.ram.free
                            )}
                            /{byteToData(pcStatus?.ram.total)} |{" "}
                            {byteToData(pcStatus?.ram.free)} free
                        </p>
                        <div className="flex items-center">
                            <p>RAM:</p>
                            <Progressbar
                                value={ramPercent}
                                className="w-full mx-3"
                            />
                            <p>{Math.floor(ramPercent)}%</p>
                        </div>
                        {pcStatus?.swap && (
                            <>
                                <div className="bg-slate-700 w-full h-0.5 rounded my-2" />
                                Swap:{" "}
                                {byteToData(
                                    pcStatus?.swap.total - pcStatus?.swap.free
                                )}
                                /{byteToData(pcStatus?.swap.total)} |{" "}
                                {byteToData(pcStatus?.swap.free)} free
                                <div className="flex items-center">
                                    <p>Swap:</p>
                                    <Progressbar
                                        value={swapPercent}
                                        className="w-full mx-3"
                                    />
                                    <p>{Math.floor(swapPercent)}%</p>
                                </div>
                            </>
                        )}
                        <CanvasChart
                            {...chartConfig}
                            datasets={memoryDatasets}
                            title="Memory Usage"
                        />
                        <div className="bg-slate-700 w-full h-0.5 rounded my-2" />
                        <p>Storages</p>
                        <ul>
                            {storages.map((storage, i) => {
                                const storagePercent = getPercent(
                                    storage.free,
                                    storage.total
                                )
                                return (
                                    <li
                                        key={i}
                                        className="border-2 border-slate-600"
                                    >
                                        <p>
                                            {i}:{" "}
                                            {storage.name || "Unknown Name"}
                                        </p>
                                        <div className="flex items-center">
                                            <Progressbar
                                                value={storagePercent}
                                                className="w-full mx-3"
                                            />{" "}
                                            <p>{Math.floor(storagePercent)}%</p>
                                        </div>
                                        <p>
                                            Usage:{" "}
                                            {byteToData(
                                                storage.total - storage.free
                                            )}
                                            /{byteToData(storage.total)} |{" "}
                                            {byteToData(storage.free)} free
                                        </p>
                                    </li>
                                )
                            })}
                        </ul>
                        <CanvasChart
                            {...chartConfig}
                            datasets={storageDatasets}
                            title="Storage Usage"
                        />
                        <div className="bg-slate-700 w-full h-0.5 rounded my-2" />
                        <p>Uptime: {formatUptime(pcStatus.uptime)} (raw: {pcStatus.uptime})</p>
                        {pcStatus?.gpu && (
                            <>
                                <div className="bg-slate-700 w-full h-0.5 rounded my-2" />
                                <p>GPU: {pcStatus?.gpu.name}</p>

                                <div className="flex items-center">
                                    <p>GPU:</p>
                                    <Progressbar
                                        value={pcStatus.gpu.usage}
                                        className="w-full mx-3"
                                    />{" "}
                                    <p>{Math.floor(pcStatus.gpu.usage)}%</p>
                                </div>
                                <p>
                                    VRAM:{" "}
                                    {byteToData(
                                        pcStatus?.gpu.memory.total -
                                            pcStatus?.gpu.memory.free
                                    )}
                                    /
                                    {byteToData(
                                        pcStatus?.gpu.memory.total
                                    )}{" "}
                                    |{" "}
                                    {byteToData(
                                        pcStatus?.gpu.memory.free
                                    )}{" "}
                                    free
                                </p>
                                <div className="flex items-center">
                                    <p>VRAM:</p>
                                    <Progressbar
                                        value={gpuMemPercent}
                                        className="w-full mx-3"
                                    />{" "}
                                    <p>{Math.floor(gpuMemPercent)}%</p>
                                </div>
                                <CanvasChart
                                    {...chartConfig}
                                    datasets={gpuDatasets}
                                    title="GPU Usage"
                                />
                            </>
                        )}
                        {pcStatus.loadavg && (
                            <>
                                <div className="bg-slate-700 w-full h-0.5 rounded my-2" />
                                <p>LoadAverage:</p>
                                <p>1Min: {pcStatus.loadavg[0]}</p>
                                <p>5Min: {pcStatus.loadavg[1]}</p>
                                <p>15Min: {pcStatus.loadavg[2]}</p>
                            </>
                        )}
                        {pcStatus?.networks && (
                            <>
                                <div className="bg-slate-700 w-full h-0.5 rounded my-2" />
                                <p>Networks:</p>
                                <ul>
                                    {Object.keys(pcStatus?.networks).map(
                                        (network, i) => {
                                            return (
                                                <li
                                                    key={i}
                                                    className="border-2 border-slate-600"
                                                >
                                                    <p>
                                                        {
                                                            pcStatus?.networks[
                                                                i
                                                            ].name
                                                        }
                                                        :
                                                    </p>
                                                    <p>
                                                        rx:{" "}
                                                        {byteToData(
                                                            pcStatus?.networks[
                                                                i
                                                            ].received
                                                        )}
                                                    </p>
                                                    <p>
                                                        tx:{" "}
                                                        {byteToData(
                                                            pcStatus?.networks[
                                                                i
                                                            ].transmitted
                                                        )}
                                                    </p>
                                                </li>
                                            )
                                        }
                                    )}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Focus
