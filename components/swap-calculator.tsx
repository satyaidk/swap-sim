"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeftRight, Loader2, Info, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SwapResult {
  fromAmount: number
  fromToken: string
  toAmount: number
  toToken: string
  exchangeRate: number
}

const STORAGE_KEY = "crypto_swap_inputs"

export function SwapCalculator() {
  const [fromToken, setFromToken] = useState("")
  const [toToken, setToToken] = useState("")
  const [fromAmount, setFromAmount] = useState("")
  const [fromPrice, setFromPrice] = useState("")
  const [toPrice, setToPrice] = useState("")
  const [result, setResult] = useState<SwapResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setFromToken(data.fromToken || "")
        setToToken(data.toToken || "")
        setFromAmount(data.fromAmount || "")
        setFromPrice(data.fromPrice || "")
        setToPrice(data.toPrice || "")
      } catch (err) {
        console.error("Error loading saved data:", err)
      }
    }
  }, [])

  useEffect(() => {
    const data = { fromToken, toToken, fromAmount, fromPrice, toPrice }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [fromToken, toToken, fromAmount, fromPrice, toPrice])

  const fetchTokenPrices = async () => {
    if (!fromToken.trim() || !toToken.trim()) {
      setError("Please enter both token names")
      return
    }

    setIsLoadingPrice(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromToken.toLowerCase()},${toToken.toLowerCase()}&vs_currencies=usd`,
      )
      const data = await response.json()

      if (data[fromToken.toLowerCase()]?.usd && data[toToken.toLowerCase()]?.usd) {
        setFromPrice(data[fromToken.toLowerCase()].usd.toString())
        setToPrice(data[toToken.toLowerCase()].usd.toString())
      } else {
        setError("One or both tokens not found. Use full names like 'ethereum', 'bitcoin'.")
      }
    } catch {
      setError("Failed to fetch token prices. Please try again.")
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromPrice(toPrice)
    setToPrice(fromPrice)
  }

  const calculateSwap = async () => {
    setError(null)

    if (!fromToken.trim() || !toToken.trim()) return setError("Please enter both token names")

    const fromAmountNum = Number.parseFloat(fromAmount)
    const fromPriceNum = Number.parseFloat(fromPrice)
    const toPriceNum = Number.parseFloat(toPrice)

    if (isNaN(fromAmountNum) || fromAmountNum <= 0) return setError("Please enter a valid amount")
    if (isNaN(fromPriceNum) || fromPriceNum <= 0) return setError("Please enter a valid 'From' price")
    if (isNaN(toPriceNum) || toPriceNum <= 0) return setError("Please enter a valid 'To' price")

    setIsCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const fromValue = fromAmountNum * fromPriceNum
    const toAmount = fromValue / toPriceNum
    const exchangeRate = fromPriceNum / toPriceNum

    setResult({
      fromAmount: fromAmountNum,
      fromToken,
      toAmount,
      toToken,
      exchangeRate,
    })
    setIsCalculating(false)
  }

  const resetCalculator = () => {
    setFromToken("")
    setToToken("")
    setFromAmount("")
    setFromPrice("")
    setToPrice("")
    setResult(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="space-y-8 w-full max-w-3xl mx-auto py-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden group border border-white/10"
      >
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent/20 rounded-full mix-blend-screen filter blur-[80px] pointer-events-none"></div>

        <div className="text-center md:text-left mb-10">
          <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">Token Swap.</h2>
          <p className="text-muted-foreground mt-2 font-medium tracking-wide">Estimate accurate exchange rates and output tokens instantly.</p>
        </div>

        <div className="space-y-8 relative z-10 w-full">
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label className="font-semibold text-foreground/80 pl-1 uppercase text-xs tracking-wider">From Asset</Label>
              <Input
                placeholder="e.g., ethereum"
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="bg-background/50 h-14 backdrop-blur-md rounded-xl text-lg font-semibold border-white/10 focus:border-accent"
              />
            </div>

            <motion.div whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }} className="mx-auto md:mx-2 md:mb-2 z-10">
              <Button onClick={handleSwapTokens} size="icon" variant="outline" className="w-12 h-12 rounded-full border-white/20 bg-card hover:bg-accent hover:text-white transition-all shadow-lg">
                <ArrowLeftRight className="w-5 h-5" />
              </Button>
            </motion.div>

            <div className="flex-1 space-y-2 w-full">
              <Label className="font-semibold text-foreground/80 pl-1 uppercase text-xs tracking-wider">To Asset</Label>
              <Input
                placeholder="e.g., solana"
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="bg-background/50 h-14 backdrop-blur-md rounded-xl text-lg font-semibold border-white/10 focus:border-accent"
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} className="w-full">
            <Button
              onClick={fetchTokenPrices}
              disabled={isLoadingPrice}
              className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all rounded-xl"
            >
              {isLoadingPrice ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Fetch Current Cloud Prices"}
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">Amount to Swap</Label>
              <Input type="number" placeholder="0.00" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} className="bg-transparent border-0 border-b border-foreground/10 rounded-none focus-visible:ring-0 focus-visible:border-accent px-1 text-2xl font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">{fromToken ? fromToken : "From"} Price ($)</Label>
              <Input type="number" placeholder="0.00" value={fromPrice} onChange={(e) => setFromPrice(e.target.value)} className="bg-transparent border-0 border-b border-foreground/10 rounded-none focus-visible:ring-0 focus-visible:border-accent px-1 text-2xl font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">{toToken ? toToken : "To"} Price ($)</Label>
              <Input type="number" placeholder="0.00" value={toPrice} onChange={(e) => setToPrice(e.target.value)} className="bg-transparent border-0 border-b border-foreground/10 rounded-none focus-visible:ring-0 focus-visible:border-accent px-1 text-2xl font-mono" />
            </div>
          </div>
          
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="mt-6 text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-xl p-4 flex text-sm items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> <span className="font-semibold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            onClick={calculateSwap}
            disabled={isCalculating}
            className="flex-1 h-14 rounded-xl bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity text-primary-foreground font-black text-lg shadow-[0_4px_20px_var(--primary)] shadow-accent/20"
          >
            {isCalculating ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : "Preview Swap Route"}
          </Button>
          <Button onClick={resetCalculator} variant="outline" className="h-14 px-8 rounded-xl border-white/20 hover:bg-white/10 bg-transparent text-foreground backdrop-blur-md font-bold">
            Clear
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative border border-white/20"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ArrowLeftRight className="w-48 h-48" />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Swap Estimate</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="glass p-6 rounded-2xl border-l-4 border-l-muted text-left shadow-lg bg-background/40">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest mb-1 flex items-center gap-2"><ArrowLeftRight className="w-4 h-4 opacity-50"/> Pay With</p>
                <div className="text-3xl font-black mt-2">
                  <span className="text-foreground">{result.fromAmount.toLocaleString()}</span> <span className="opacity-50 text-xl">{result.fromToken.toUpperCase()}</span>
                </div>
                <p className="text-sm font-medium mt-2 text-foreground/50">
                  ≈ ${(result.fromAmount * (Number.parseFloat(fromPrice) || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})} USD
                </p>
              </div>

              <div className="glass p-6 rounded-2xl border-l-4 border-l-accent text-left shadow-lg bg-accent/5 backdrop-blur-md">
                <p className="text-sm text-accent uppercase font-bold tracking-widest mb-1 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 opacity-50"/> You Will Receive</p>
                <div className="text-3xl font-black mt-2">
                  <span className="text-accent">{result.toAmount.toLocaleString(undefined, {maximumFractionDigits: 6})}</span> <span className="opacity-50 text-xl text-accent/80">{result.toToken.toUpperCase()}</span>
                </div>
                <p className="text-sm font-medium mt-2 text-foreground/50">
                  ≈ ${(result.toAmount * (Number.parseFloat(toPrice) || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})} USD
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl flex items-center justify-between border border-white/5 bg-black/10 dark:bg-white/5 relative z-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Info className="w-4 h-4" /> Exchange Rate
              </div>
              <p className="font-mono text-foreground font-bold text-sm md:text-base">
                1 {result.fromToken.toUpperCase()} = {result.exchangeRate.toLocaleString(undefined, {maximumFractionDigits: 6})} {result.toToken.toUpperCase()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
