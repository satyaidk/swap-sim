"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCalculation, type SavedCalculation } from "@/lib/user-storage"
import { Loader2, Zap, Save, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"

interface CalculationResult {
  currentValue: number
  futureValue: number
  profit: number
  percentageGain: number
}

const STORAGE_KEY = "crypto_calculator_inputs"

export function ProfitCalculator({ walletAddress }: { walletAddress?: string | null }) {
  const [tokenName, setTokenName] = useState("")
  const [holdings, setHoldings] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setTokenName(data.tokenName || "")
        setHoldings(data.holdings || "")
        setCurrentPrice(data.currentPrice || "")
        setTargetPrice(data.targetPrice || "")
      } catch (err) {
        console.error("Error loading saved data", err)
      }
    }
  }, [])

  useEffect(() => {
    const data = { tokenName, holdings, currentPrice, targetPrice }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [tokenName, holdings, currentPrice, targetPrice])

  const fetchTokenPrice = async () => {
    if (!tokenName.trim()) {
      setError("Please enter a token name")
      return
    }

    setIsLoadingPrice(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenName.toLowerCase()}&vs_currencies=usd`
      )
      const data = await response.json()

      if (data[tokenName.toLowerCase()]?.usd) {
        const price = data[tokenName.toLowerCase()].usd
        setCurrentPrice(price.toString())
      } else {
        setError(`Token "${tokenName}" not found. Try "bitcoin" or "ethereum".`)
      }
    } catch {
      setError("Failed to fetch token price. Please try again.")
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const calculateProfit = async () => {
    setError(null)
    
    if (!tokenName.trim()) return setError("Please enter a token name")

    const holdingsNum = Number.parseFloat(holdings)
    const currentPriceNum = Number.parseFloat(currentPrice)
    const targetPriceNum = Number.parseFloat(targetPrice)

    if (isNaN(holdingsNum) || holdingsNum <= 0) return setError("Please enter a valid holdings amount")
    if (isNaN(currentPriceNum) || currentPriceNum <= 0) return setError("Please enter a valid current price")
    if (isNaN(targetPriceNum) || targetPriceNum <= 0) return setError("Please enter a valid target price")

    setIsCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, 800)) // smooth delay
    
    const currentValue = holdingsNum * currentPriceNum
    const futureValue = holdingsNum * targetPriceNum
    const profit = futureValue - currentValue
    const percentageGain = (profit / currentValue) * 100

    setResult({ currentValue, futureValue, profit, percentageGain })
    setIsCalculating(false)
  }

  const handleSaveCalculation = () => {
    if (!walletAddress || !result) return

    const resultForStorage: SavedCalculation["result"] = {
      currentValue: result.currentValue,
      futureValue: result.futureValue,
      profit: result.profit,
      percentageGain: result.percentageGain,
    }

    saveCalculation(
      walletAddress,
      "profit",
      { tokenName, holdings, currentPrice, targetPrice },
      resultForStorage,
      `${tokenName.toUpperCase()} - ${new Date().toLocaleDateString()}`
    )

    setSaveMessage("Calculation saved successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const resetCalculator = () => {
    setTokenName("")
    setHoldings("")
    setCurrentPrice("")
    setTargetPrice("")
    setResult(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  // Generate charting data simulating growth to target
  const chartData = useMemo(() => {
    if (!result) return []
    const curP = Number.parseFloat(currentPrice)
    const tarP = Number.parseFloat(targetPrice)
    const hold = Number.parseFloat(holdings)
    
    // Create 6 steps from curP to tarP
    const steps = 6
    const diff = (tarP - curP) / steps
    
    const data = []
    for (let i = 0; i <= steps; i++) {
      const p = curP + (diff * i)
      data.push({
        priceLabel: `$${p.toFixed(2)}`,
        price: p,
        value: p * hold,
      })
    }
    return data
  }, [result, currentPrice, targetPrice, holdings])



  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto py-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 md:p-10 shadow-lg relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-blob"></div>

        <div className="space-y-2 mb-8 text-center sm:text-left">
          <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Simulate Profits.</h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium">Calculate your potential crypto returns with advanced visualizations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-4">
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <Label className="font-semibold text-foreground/80">Token ID / Name</Label>
              <div className="flex gap-2 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-md rounded-lg -z-10"></div>
                <Input
                  placeholder="e.g., bitcoin, solana"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="bg-background/60 backdrop-blur-sm border-white/10 shadow-inner"
                />
                <Button onClick={fetchTokenPrice} disabled={isLoadingPrice} className="bg-primary/90 hover:bg-primary shadow-lg shadow-primary/30">
                  {isLoadingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
                </Button>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <Label className="font-semibold text-foreground/80">Amount Held (Tokens)</Label>
              <Input
                type="number"
                placeholder="e.g., 0.5"
                value={holdings}
                onChange={(e) => setHoldings(e.target.value)}
                className="bg-background/60 backdrop-blur-sm border-white/10"
              />
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <Label className="font-semibold text-foreground/80">Current Price (USD)</Label>
              <Input
                type="number"
                placeholder="e.g., 65000"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="bg-background/60 backdrop-blur-sm border-white/10"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <Label className="font-semibold text-foreground/80">Target Sell Price (USD)</Label>
              <Input
                type="number"
                placeholder="e.g., 100000"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="bg-background/60 backdrop-blur-sm border-white/10"
              />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-lg p-3 flex text-sm items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            onClick={calculateProfit}
            disabled={isCalculating}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-bold shadow-xl shadow-primary/20"
            size="lg"
          >
            {isCalculating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
            {isCalculating ? "Simulating Future..." : "Run Simulation"}
          </Button>
          <Button onClick={resetCalculator} variant="outline" size="lg" className="border-white/20 hover:bg-white/10 bg-transparent backdrop-blur-md">
            Reset
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 md:p-10 shadow-xl overflow-hidden relative"
          >
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground mb-6">Simulation Results</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass p-4 rounded-xl text-center shadow-lg border-white/5 bg-background/30 hover:bg-background/50 transition-colors">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Spent</p>
                <p className="text-xl md:text-2xl font-black">${result.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div className="glass p-4 rounded-xl text-center shadow-lg border-white/5 bg-background/30 hover:bg-background/50 transition-colors">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Worth</p>
                <p className="text-xl md:text-2xl font-black">${result.futureValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div className={`p-4 rounded-xl text-center shadow-lg transition-colors border ${result.profit >= 0 ? "bg-green-500/10 border-green-500/30 text-green-500 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400"}`}>
                <p className="text-xs uppercase font-bold tracking-wider mb-1 opacity-80">Profit/Loss</p>
                <p className="text-xl md:text-2xl font-black">${Math.abs(result.profit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div className={`p-4 rounded-xl text-center shadow-lg transition-colors border ${result.percentageGain >= 0 ? "bg-green-500/10 border-green-500/30 text-green-500 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400"}`}>
                <p className="text-xs uppercase font-bold tracking-wider mb-1 opacity-80">ROI</p>
                <p className="text-xl md:text-2xl font-black">{result.percentageGain.toFixed(2)}%</p>
              </div>
            </div>

            {/* Recharts Chart for Simulation */}
            <div className="w-full h-64 md:h-80 mt-8 mb-8">
              <h4 className="text-lg font-bold mb-4 text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Target Trajectory
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="priceLabel" stroke="currentColor" className="opacity-50 text-xs font-mono" />
                  <YAxis stroke="currentColor" className="opacity-50 text-xs font-mono" tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}
                  />
                  <ReferenceLine x={chartData[0]?.priceLabel} stroke="url(#colorGrad)" strokeDasharray="3 3" label={{ position: 'insideTopLeft',  value: 'Now', fill: 'currentColor', fontSize: 12, opacity: 0.5 }} />
                  <ReferenceLine x={chartData[chartData.length-1]?.priceLabel} stroke="url(#colorGrad)" strokeDasharray="3 3" label={{ position: 'insideTopRight',  value: 'Target', fill: 'currentColor', fontSize: 12, opacity: 0.5 }} />
                  
                  <defs>
                    <linearGradient id="colorGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#colorGrad)" 
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: "hsl(var(--accent))" }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background/40 p-4 rounded-xl border border-white/5">
              {saveMessage ? (
                <div className="text-green-500 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {saveMessage}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex-1">
                  Want to track this scenario? Link your wallet and save it to your profile.
                </p>
              )}
              
              {walletAddress && (
                <Button onClick={handleSaveCalculation} className="bg-white/10 hover:bg-white/20 text-foreground w-full sm:w-auto backdrop-blur-md">
                  <Save className="w-4 h-4 mr-2" /> Save to Portfolio
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
