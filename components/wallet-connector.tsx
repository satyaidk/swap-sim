"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, LogOut, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EthereumProvider {
  request: (args: { method: string }) => Promise<string[]>
}

interface WalletConnectorProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
  compact?: boolean
}

export function WalletConnector({ onConnect, onDisconnect, compact = false }: WalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  const checkWalletConnection = useCallback(async () => {
    try {
      const ethereum = typeof window !== "undefined" ? (window as unknown as { ethereum?: EthereumProvider }).ethereum : undefined
      if (ethereum) {
        const accounts = await ethereum.request({
          method: "eth_accounts",
        })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          onConnect(accounts[0])
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }, [onConnect])

  useEffect(() => {
    void checkWalletConnection()
  }, [checkWalletConnection])

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const ethereum = typeof window !== "undefined" ? (window as unknown as { ethereum?: EthereumProvider }).ethereum : undefined
      if (!ethereum) {
        // Simulate connection if no metamask is present for test purposes since it's a mock originally
        setIsSigningIn(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const mockAddress = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
        setAddress(mockAddress)
        setIsConnected(true)
        setIsSigningIn(false)
        onConnect(mockAddress)
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length > 0) {
        const userAddress = accounts[0]
        setIsSigningIn(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setAddress(userAddress)
        setIsConnected(true)
        setIsSigningIn(false)
        onConnect(userAddress)
      }
    } catch (err: unknown) {
      const errorWithCode = err as { code?: number }
      setIsSigningIn(false)
      if (errorWithCode.code === 4001) {
        setError("Connection rejected by user")
      } else {
        setError("Failed to connect wallet")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setError(null)
    onDisconnect()
  }

  if (isSigningIn) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4 glass-card rounded-2xl border border-primary/20">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent"
          ></motion.div>
          <Zap className="w-5 h-5 text-accent animate-pulse" />
        </div>
        <p className="text-xs font-bold text-foreground animate-pulse">Signature Required</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isConnected && address ? (
            <motion.div 
              key="connected"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgb(34,197,94)] animate-pulse"></div>
                <span className="text-xs font-mono font-bold text-foreground">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <Button onClick={handleDisconnect} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/20 hover:text-destructive transition-colors text-muted-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div key="connect" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button
                onClick={connectWallet}
                disabled={isLoading}
                className="text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[0_0_15px_var(--primary)] shadow-accent/20 transition-all text-white border-none h-9 px-4"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                {isLoading ? "Connecting" : "Connect"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive font-bold text-center animate-shake">
          {error}
        </div>
      )}
      <Button
        onClick={isConnected ? handleDisconnect : connectWallet}
        disabled={isLoading || isSigningIn}
        variant={isConnected ? "outline" : "default"}
        className={`w-full h-14 rounded-2xl font-bold text-lg transition-all ${
          isConnected 
            ? "border-destructive/20 text-destructive hover:bg-destructive/10" 
            : "bg-gradient-to-r from-primary to-accent text-white shadow-xl hover:scale-[1.02]"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : isConnected ? (
          <LogOut className="w-5 h-5 mr-2" />
        ) : (
          <Wallet className="w-5 h-5 mr-2" />
        )}
        {isLoading ? "Connecting..." : isConnected ? "Disconnect Wallet" : "Connect Wallet"}
      </Button>
      {!isConnected && <p className="text-xs text-muted-foreground text-center font-medium">Supports Web3 Wallets (or simulated fallback)</p>}
    </div>
  )
}
