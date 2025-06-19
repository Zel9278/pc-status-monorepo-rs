import { useEffect, useState } from 'react'

interface ToastData {
    message: string
    color: string
    toast_time: number
}

interface UseToastReturn {
    toast: ToastData | null
    clearToast: () => void
}

export const useToast = (): UseToastReturn => {
    const [toast, setToast] = useState<ToastData | null>(null)

    useEffect(() => {
        const handleToast = (event: CustomEvent<ToastData>) => {
            setToast(event.detail)
            
            // 指定された時間後に自動的にクリア
            setTimeout(() => {
                setToast(null)
            }, event.detail.toast_time || 5000)
        }

        window.addEventListener('websocket-toast', handleToast as EventListener)

        return () => {
            window.removeEventListener('websocket-toast', handleToast as EventListener)
        }
    }, [])

    const clearToast = () => {
        setToast(null)
    }

    return { toast, clearToast }
}
