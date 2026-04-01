"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { PreBuyCalculator } from "@/components/pre-buy-calculator"
import { Card } from "@/components/ui/card"

export default function PreBuyPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar
        walletAddress={walletAddress}
        isConnected={isConnected}
        onConnect={(address) => {
          setWalletAddress(address)
          setIsConnected(true)
        }}
        onDisconnect={() => {
          setWalletAddress(null)
          setIsConnected(false)
        }}
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Content */}
        {isConnected && walletAddress ? (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-border">
              <div className="p-6 md:p-8">
                <div className="mb-8 p-4 bg-secondary border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">Connected Wallet</p>
                  <p className="text-foreground font-mono text-sm break-all font-semibold">{walletAddress}</p>
                </div>
                <PreBuyCalculator />
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card className="bg-card border-border">
              <div className="p-8 text-center space-y-4">
                <div className="text-5xl">🔐</div>
                <p className="text-muted-foreground">Connect your wallet to start planning your purchases</p>
                <p className="text-xs text-muted-foreground">Use the Connect button in the top right to get started</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
