interface Result {
    cpu: number
}

export function getPercent(free: number, total: number): number {
    return Math.floor((1 - free / total) * 100)
}

export function getCPUPercent(result: Result[]): number {
    return result.length === 0 ? 0 : Math.floor(result.map((a) => a.cpu).reduce((a, b) => a + b) / result.length)
}
