"use client"

import { useEffect, useState } from "react"

import { TrendingUp, TrendingDown, RefreshCcw } from "lucide-react"

interface CoinData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
}

export function LiveTicker() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
        )
        const data = await response.json()
        if (Array.isArray(data)) {
          setCoins(data)
        } else {
          console.warn("CoinGecko API rate limit or error:", data)
          // Fallback static data to keep UI looking nice
          setCoins([
            { id: "btc", symbol: "btc", name: "Bitcoin", current_price: 65000, price_change_percentage_24h: 2.5 },
            { id: "eth", symbol: "eth", name: "Ethereum", current_price: 3500, price_change_percentage_24h: 1.2 },
            { id: "sol", symbol: "sol", name: "Solana", current_price: 150, price_change_percentage_24h: 5.4 },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch ticker data", error)
        setCoins([
          { id: "btc", symbol: "btc", name: "Bitcoin", current_price: 65000, price_change_percentage_24h: 2.5 },
          { id: "eth", symbol: "eth", name: "Ethereum", current_price: 3500, price_change_percentage_24h: 1.2 },
          { id: "sol", symbol: "sol", name: "Solana", current_price: 150, price_change_percentage_24h: 5.4 },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoins()
    const interval = setInterval(fetchCoins, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
        <RefreshCcw className="w-3 h-3 animate-spin" /> Fetching Markets...
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden bg-card/40 border-b border-border py-1.5 hidden sm:block">
      <div className="flex whitespace-nowrap animate-shimmer" style={{ animationDuration: '40s' }}>
        {/* Double the array to scroll smoothly */}
        {[...coins, ...coins].map((coin, i) => {
          const isPositive = coin.price_change_percentage_24h >= 0
          return (
            <div key={`${coin.id}-${i}`} className="inline-flex items-center gap-2 mx-6 text-xs font-semibold">
              <span className="text-muted-foreground uppercase">{coin.symbol}</span>
              <span className="text-foreground">${coin.current_price.toLocaleString()}</span>
              <span className={isPositive ? "text-green-500" : "text-destructive"}>
                {isPositive ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
