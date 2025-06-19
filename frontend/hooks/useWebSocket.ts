import { useEffect, useState, useRef, useCallback } from 'react'
import { ClientData } from '../types/client'

interface ToastData {
    message: string
    duration: number
}

interface UseWebSocketReturn {
    status: ClientData | undefined
    connected: boolean
    error: string | null
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
    const [status, setStatus] = useState<ClientData | undefined>()
    const [connected, setConnected] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttempts = useRef<number>(0)
    const maxReconnectAttempts = 10
    const reconnectDelay = 5000

    // デバッグ用：環境変数の確認
    console.log('Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    })

    const connect = useCallback(() => {
        try {
            // WebSocketのプロトコルとURLを決定
            let wsUrl: string

            // 環境変数が設定されている場合は優先的に使用
            const customUrl = process.env.NEXT_PUBLIC_WS_URL

            if (customUrl) {
                wsUrl = customUrl
                console.log('Using custom WebSocket URL from env:', wsUrl)
            } else if (process.env.NODE_ENV === 'production') {
                // GitHub Pages環境ではデフォルトサーバーを使用
                wsUrl = 'wss://pcss.eov2.com/ws'
                console.log('Using default production WebSocket URL:', wsUrl)
            } else {
                // 開発環境ではローカルサーバーに接続
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
                const host = window.location.host
                wsUrl = `${protocol}//${host}/server`
                console.log('Using local development WebSocket URL:', wsUrl)
            }

            console.log('Connecting to WebSocket:', wsUrl)
            
            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                console.log('WebSocket connected')
                setConnected(true)
                setError(null)
                reconnectAttempts.current = 0
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log('Received message:', data)

                    switch (data.type) {
                        case 'Hi':
                            console.log('Server greeting:', data.data)
                            break
                        case 'Status':
                            setStatus(data.data)
                            break
                        case 'Toast':
                            // トーストメッセージをカスタムイベントとして発火
                            const toastEvent = new CustomEvent('websocket-toast', {
                                detail: data.data
                            })
                            window.dispatchEvent(toastEvent)
                            break
                        case 'Close':
                            console.log('Server requested close')
                            ws.close()
                            break
                        case 'Sync':
                            console.log('Sync message:', data.data)
                            break
                        default:
                            console.log('Unknown message type:', data.type)
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err)
                }
            }

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason)
                setConnected(false)
                setStatus({})
                wsRef.current = null

                // 自動再接続
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++
                    console.log(`Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect()
                    }, reconnectDelay)
                } else {
                    setError('Failed to connect after multiple attempts')
                }
            }

            ws.onerror = (event) => {
                console.error('WebSocket error:', event)
                console.error('Failed to connect to:', wsUrl)
                console.error('Make sure the server is running on the correct address and port')
                setError(`WebSocket connection error: ${wsUrl}`)
            }

        } catch (err) {
            console.error('Error creating WebSocket:', err)
            setError('Failed to create WebSocket connection')
        }
    }, [])

    useEffect(() => {
        connect()

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [connect])

    return { status, connected, error }
}
