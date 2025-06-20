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
    const reconnectDelay = 2000  // 2秒に短縮
    const lastUpdateTime = useRef<number>(0)
    const updateCount = useRef<number>(0)

    // デバッグ用：環境変数の確認
    console.log('Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    })

    // デバッグ用：ブラウザ情報の確認
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('Browser environment:', {
                location: window.location.href,
                protocol: window.location.protocol,
                host: window.location.host,
                hostname: window.location.hostname,
                port: window.location.port,
                pathname: window.location.pathname,
                userAgent: navigator.userAgent
            })
        }
    }, [])

    const connect = useCallback(() => {
        try {
            // WebSocketのプロトコルとURLを決定
            let wsUrl: string

            // 環境変数が設定されている場合は優先的に使用
            const customUrl = process.env.NEXT_PUBLIC_WS_URL

            if (customUrl && customUrl.trim() !== '' && customUrl !== 'undefined') {
                wsUrl = customUrl
                console.log('Using custom WebSocket URL from env:', wsUrl)
            } else {
                // フォールバック: 現在のホストを使用してWebSocket URLを構築
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
                const host = window.location.host
                wsUrl = `${protocol}//${host}/server`
                console.log('Using auto-detected WebSocket URL:', wsUrl)
                console.log('Current location:', {
                    protocol: window.location.protocol,
                    host: window.location.host,
                    hostname: window.location.hostname,
                    port: window.location.port
                })
                console.warn('No NEXT_PUBLIC_WS_URL environment variable found. Using auto-detected URL.')
                console.warn('If WebSocket connection fails, make sure the server is running on the same domain.')
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
                            // Statusデータをそのまま設定
                            setStatus(data.data)
                            console.log('Status updated:', data.data)
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
                    console.error('Raw message:', event.data)
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
                console.error('Current page URL:', window.location.href)
                console.error('Environment variables:', {
                    NODE_ENV: process.env.NODE_ENV,
                    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL
                })
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
