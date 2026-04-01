"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, TrendingDown, Target, HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PreBuyResult {
  tokensToBuy: number
  totalCost: number
  pricePerToken: number
}

const PRE_BUY_STORAGE_KEY = "crypto_prebuy_inputs"

export function PreBuyCalculator() {
  const [tokenName, setTokenName] = useState("")
  const [preBuyTargetPrice, setPreBuyTargetPrice] = useState("")
  const [preBuyBudget, setPreBuyBudget] = useState("")
  const [preBuyResult, setPreBuyResult] = useState<PreBuyResult | null>(null)
  const [preBuyError, setPreBuyError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const savedPreBuy = localStorage.getItem(PRE_BUY_STORAGE_KEY)
    if (savedPreBuy) {
      try {
        const data = JSON.parse(savedPreBuy)
        setTokenName(data.tokenName || "")
        setPreBuyTargetPrice(data.targetPrice || "")
        setPreBuyBudget(data.budget || "")
      } catch (err) {
        console.error("Error loading pre-buy data:", err)
      }
    }
  }, [])

  useEffect(() => {
    const data = { tokenName, targetPrice: preBuyTargetPrice, budget: preBuyBudget }
    localStorage.setItem(PRE_BUY_STORAGE_KEY, JSON.stringify(data))
  }, [tokenName, preBuyTargetPrice, preBuyBudget])

  const calculatePreBuy = async () => {
    setPreBuyError(null)

    if (!tokenName.trim()) return setPreBuyError("Please enter a token name")

    const targetPriceNum = Number.parseFloat(preBuyTargetPrice)
    const budgetNum = Number.parseFloat(preBuyBudget)

    if (isNaN(targetPriceNum) || targetPriceNum <= 0) return setPreBuyError("Please enter a valid target buy price")
    if (isNaN(budgetNum) || budgetNum <= 0) return setPreBuyError("Please enter a valid budget amount")

    setIsCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const tokensToBuy = budgetNum / targetPriceNum

    setPreBuyResult({
      tokensToBuy,
      totalCost: budgetNum,
      pricePerToken: targetPriceNum,
    })
    setIsCalculating(false)
  }

  const resetPreBuy = () => {
    setTokenName("")
    setPreBuyTargetPrice("")
    setPreBuyBudget("")
    setPreBuyResult(null)
    setPreBuyError(null)
    localStorage.removeItem(PRE_BUY_STORAGE_KEY)
  }

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto py-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-primary/20 relative overflow-hidden"
      >
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse-glow" />

        <div className="max-w-2xl mx-auto text-center mb-10 space-y-4">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/30 shadow-inner"
          >
            <Target className="w-8 h-8" />
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Snipe the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Dip</span>.
          </h2>
          <p className="text-muted-foreground font-medium md:text-lg">
            Plan your entries exactly where you want them. Set your target price and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="space-y-3 group">
            <Label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
              Token Asset <HelpCircle className="w-4 h-4 opacity-50"/>
            </Label>
            <div className="relative">
              <Input
                placeholder="e.g. solana"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="bg-background/40 h-16 rounded-2xl border-white/10 focus:border-primary text-xl font-bold px-5 backdrop-blur-md transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-3 group">
            <Label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
              Target Entry ($) <TrendingDown className="w-4 h-4 opacity-50"/>
            </Label>
            <Input
              type="number"
              placeholder="e.g. 15.50"
              value={preBuyTargetPrice}
              onChange={(e) => setPreBuyTargetPrice(e.target.value)}
              className="bg-background/40 h-16 rounded-2xl border-white/10 focus:border-primary text-xl font-bold px-5 backdrop-blur-md transition-all shadow-inner font-mono"
            />
          </div>

          <div className="space-y-3 group">
            <Label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
              Total Budget ($) <Wallet className="w-4 h-4 opacity-50"/>
            </Label>
            <Input
              type="number"
              placeholder="e.g. 1000"
              value={preBuyBudget}
              onChange={(e) => setPreBuyBudget(e.target.value)}
              className="bg-background/40 h-16 rounded-2xl border-white/10 focus:border-primary text-xl font-bold px-5 backdrop-blur-md transition-all shadow-inner font-mono"
            />
          </div>
        </div>

        <AnimatePresence>
          {preBuyError && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm font-bold flex items-center justify-center">
              {preBuyError}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
          <Button
            onClick={calculatePreBuy}
            disabled={isCalculating}
            className="w-full sm:w-1/2 h-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isCalculating ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : "Plan Entry"}
          </Button>
          <Button
            onClick={resetPreBuy}
            variant="ghost"
            className="w-full sm:w-auto h-16 rounded-2xl hover:bg-white/10 text-muted-foreground font-bold px-8 backdrop-blur"
          >
            Reset
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {preBuyResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-3xl p-6 md:p-10 shadow-xl border-t-4 border-t-accent relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 cursor-default">
              <h3 className="text-2xl font-black text-foreground">Purchasing Power</h3>
              <div className="px-4 py-1.5 rounded-full bg-accent/20 text-accent font-bold text-sm border border-accent/20">
                Strategy Executed
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-start p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Cost Basis</span>
                <span className="text-3xl font-mono text-foreground">${preBuyResult.pricePerToken.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex flex-col items-start p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Allocated</span>
                <span className="text-3xl font-mono text-foreground">${preBuyResult.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex flex-col items-start p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 shadow-inner">
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Total Yield</span>
                <span className="text-3xl md:text-4xl font-black text-foreground break-all">{preBuyResult.tokensToBuy.toLocaleString(undefined, {maximumFractionDigits: 6})} <span className="text-lg text-primary opacity-80">{tokenName.toUpperCase() || "TOKENS"}</span></span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-muted/30 rounded-xl text-center text-sm font-medium text-muted-foreground border border-white/5">
              If {tokenName ? <span className="text-foreground">{tokenName}</span> : "this asset"} drops to <span className="text-foreground">${preBuyResult.pricePerToken.toLocaleString()}</span>, your <span className="text-foreground">${preBuyResult.totalCost.toLocaleString()}</span> budget will secure <span className="text-primary font-bold">{preBuyResult.tokensToBuy.toLocaleString(undefined, {maximumFractionDigits: 6})}</span> units.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
