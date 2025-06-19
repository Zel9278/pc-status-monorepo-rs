interface CPUData {
    cpu: number
}
interface CPU {
    model: string
    cpus: CPUData[]
}

interface RAM {
    free: number
    total: number
}

interface Swap {
    free: number
    total: number
}

interface Storage {
    name?: string
    free: number
    total: number
}

interface GPUMemory {
    free: number
    total: number
}
interface GPU {
    name: string
    usage: number
    memory: GPUMemory
}
interface NetWorkData {
    name: string
    received: number
    transmitted: number
}

interface HistoriesData {
    cpu: CPU
    ram: RAM
    swap: Swap
    storages: Storage[]
    gpu: GPU
    uptime: number
}

export interface StatusData {
    _os: string
    hostname: string
    version: string
    cpu: CPU
    ram: RAM
    swap: Swap
    storages: Storage[]
    uptime: number
    loadavg: number[]
    gpu: GPU
    networks: NetWorkData[]
    histories: HistoriesData[]
}
