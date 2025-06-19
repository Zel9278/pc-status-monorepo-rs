export default function selectIcon(osName: string): string {
    switch (true) {
        case /Windows/.test(osName):
            return "/icon/os/windows.svg"
        case /Debian/.test(osName):
            return "/icon/os/debian.svg"
        case /Raspbian/.test(osName):
            return "/icon/os/raspbian.svg"
        case /Ubuntu/.test(osName):
            return "/icon/os/ubuntu.svg"
        case /Arch/.test(osName):
            return "/icon/os/arch.svg"
        case /Fedora/.test(osName):
            return "/icon/os/fedora.svg"
        case /Darwin/.test(osName):
            return "/icon/os/apple.svg"
        case /Distroless/.test(osName):
            return "/icon/os/docker.svg"
        default:
            return "/icon/os/linux.svg"
    }
}
