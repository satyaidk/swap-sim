"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Trash2, Trash, UserCircle, Activity, LayoutDashboard, Calculator } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  getUserProfile,
  getSavedCalculations,
  deleteSavedCalculation,
  clearAllSavedCalculations,
  type UserProfile,
  type SavedCalculation,
} from "@/lib/user-storage"

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#8b5cf6', '#06b6d4']

export default function ProfilePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      setProfile(getUserProfile(walletAddress))
      setSavedCalculations(getSavedCalculations(walletAddress))
    }
  }, [walletAddress])

  // Dashboard Stats
  const chartData = useMemo(() => {
    const counts = { profit: 0, swap: 0, prebuy: 0 }
    savedCalculations.forEach(c => {
      if (counts[c.type as keyof typeof counts] !== undefined) {
        counts[c.type as keyof typeof counts]++
      }
    })
    return [
      { name: 'Simulations', value: counts.profit },
      { name: 'Swaps', value: counts.swap },
      { name: 'Pre-buys', value: counts.prebuy }
    ].filter(i => i.value > 0)
  }, [savedCalculations])

  if (!mounted) return null

  const handleDeleteCalculation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (walletAddress) {
      deleteSavedCalculation(walletAddress, id)
      setSavedCalculations(getSavedCalculations(walletAddress))
    }
  }

  const handleClearAll = () => {
    if (walletAddress) {
      clearAllSavedCalculations(walletAddress)
      setSavedCalculations([])
      setShowClearConfirm(false)
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <Navbar 
        walletAddress={walletAddress} 
        isConnected={isConnected} 
        onConnect={(addr) => {setWalletAddress(addr); setIsConnected(true)}} 
        onDisconnect={() => {setWalletAddress(null); setIsConnected(false)}} 
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12 z-10">
        
        {isConnected && walletAddress ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Header section with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Profile Overview */}
              <div className="md:col-span-1 glass-card rounded-3xl p-6 border-white/10 flex flex-col items-center text-center relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/20 to-transparent -z-10"></div>
                <div className="w-24 h-24 rounded-full bg-background border-4 border-primary/20 overflow-hidden flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform">
                  <UserCircle className="w-16 h-16 text-muted-foreground/50" />
                </div>
                <h1 className="text-2xl font-black text-foreground">{profile?.name || "Web3 Explorer"}</h1>
                <p className="text-xs font-mono text-muted-foreground mt-2 bg-secondary/50 px-3 py-1 rounded-full border border-white/5">{walletAddress}</p>
              </div>

              {/* Chart Stats */}
              <div className="md:col-span-2 glass-card rounded-3xl p-6 border-white/10 shadow-xl flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-foreground"><LayoutDashboard className="w-5 h-5 text-accent"/> Activity Dashboard</h3>
                  <p className="text-sm text-muted-foreground w-full max-w-sm">
                    You have saved {savedCalculations.length} total technical setups and calculation scenarios.
                  </p>
                  
                  <div className="flex gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-background/50 border border-white/5 shadow-inner">
                      <p className="text-3xl font-black text-primary">{chartData[0]?.value || 0}</p>
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Profits</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 border border-white/5 shadow-inner">
                      <p className="text-3xl font-black text-accent">{chartData[1]?.value || 0}</p>
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Swaps</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 border border-white/5 shadow-inner">
                      <p className="text-3xl font-black text-[#8b5cf6]">{chartData[2]?.value || 0}</p>
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Entries</p>
                    </div>
                  </div>
                </div>

                <div className="w-48 h-48 relative hidden sm:block">
                  {savedCalculations.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                      <Activity className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calculations List */}
            <div className="glass-card rounded-3xl p-6 md:p-8 border-white/10 shadow-2xl relative">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-primary" /> Saved Scenarios
                </h2>
                {savedCalculations.length > 0 && (
                  <Button onClick={() => setShowClearConfirm(true)} variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl px-4 font-bold text-sm">
                    <Trash className="w-4 h-4 mr-2" /> Clear History
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showClearConfirm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-destructive font-bold text-sm">Delete all saved data permanently?</p>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button onClick={handleClearAll} className="flex-1 sm:flex-none bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg h-9">Confirm</Button>
                      <Button onClick={() => setShowClearConfirm(false)} variant="outline" className="flex-1 sm:flex-none border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg h-9">Cancel</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {savedCalculations.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <Activity className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No data found</h3>
                  <p className="text-muted-foreground font-medium text-sm">Run some calculations and save them to your portfolio to track them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {savedCalculations.map((calc, i) => (
                      <motion.div
                        key={calc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 bg-background/40 hover:bg-white/5 border border-white/5 rounded-2xl transition-colors cursor-default relative group shadow-inner"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 mb-2 inline-block">
                              {calc.type}
                            </span>
                            <p className="font-bold text-lg text-foreground truncate w-48">{calc.name}</p>
                          </div>
                          
                          <Button onClick={(e) => handleDeleteCalculation(calc.id, e)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {calc.type === "profit" && (
                          <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2">
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Est. ROI</p>
                              <p className={`text-xl font-black ${(calc.result as any).profit >= 0 ? "text-green-500" : "text-destructive"}`}>
                                {(calc.result as any).percentageGain?.toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Future Value</p>
                              <p className="text-xl font-black text-foreground">${(calc.result as any).futureValue?.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:2})}</p>
                            </div>
                          </div>
                        )}

                        {calc.type === "swap" && (
                          <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2">
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rate</p>
                              <p className="text-sm font-black text-foreground">
                                1:{(calc.result as any).exchangeRate?.toFixed(4)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Receive</p>
                              <p className="text-xl font-black text-accent">{(calc.result as any).toAmount?.toLocaleString(undefined, {maximumFractionDigits:4})} {(calc.result as any).toToken?.toUpperCase()}</p>
                            </div>
                          </div>
                        )}

                        {calc.type === "prebuy" && (
                          <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2">
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Target Price</p>
                              <p className="text-xl font-black text-foreground">
                                ${(calc.result as any).pricePerToken?.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tokens</p>
                              <p className="text-xl font-black text-[#8b5cf6]">{(calc.result as any).tokensToBuy?.toLocaleString(undefined, {maximumFractionDigits:4})}</p>
                            </div>
                          </div>
                        )}
                        
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mt-20">
            <div className="glass-card rounded-[2.5rem] p-10 text-center border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
              <div className="relative z-10 space-y-6">
                <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                  <UserCircle className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black">Authentication Required</h2>
                  <p className="text-sm text-muted-foreground font-medium">Connect your wallet securely to view your personalized dashboard and saved strategies.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
