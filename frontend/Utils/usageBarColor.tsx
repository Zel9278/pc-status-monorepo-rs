export default function usageBarColor(percent: number): string {
    if (percent > 90) return "#e44"
    if (percent > 75) return "#cc2"
    return "#4e4"
}
