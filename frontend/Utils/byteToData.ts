export function byteToData(a: number, b = 2): string {
    if (0 === a) return "0 Bytes"
    const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024))
    const datas: string[] = [
        "Bytes",
        "KB",
        "MB",
        "GB",
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB",
    ]
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + datas[d]
}
