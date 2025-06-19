export default function selectIcon(osName: string): string {
    // デバッグログを追加
    console.log('OS Name for icon selection:', osName);

    switch (true) {
        case /Windows/.test(osName):
            console.log('Matched Windows');
            return "/icon/os/windows.svg"
        case /Debian/.test(osName):
            console.log('Matched Debian');
            return "/icon/os/debian.svg"
        case /Raspbian/.test(osName):
            console.log('Matched Raspbian');
            return "/icon/os/raspbian.svg"
        case /Ubuntu/.test(osName):
            console.log('Matched Ubuntu');
            return "/icon/os/ubuntu.svg"
        case /Arch/.test(osName):
            console.log('Matched Arch');
            return "/icon/os/arch.svg"
        case /Fedora/.test(osName):
            console.log('Matched Fedora');
            return "/icon/os/fedora.svg"
        case /Darwin/.test(osName):
            console.log('Matched Darwin/macOS');
            return "/icon/os/apple.svg"
        case /Distroless/.test(osName):
            console.log('Matched Distroless');
            return "/icon/os/docker.svg"
        default:
            console.log('No match found, using default Linux icon');
            return "/icon/os/linux.svg"
    }
}
