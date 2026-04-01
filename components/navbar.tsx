"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { WalletConnector } from "@/components/wallet-connector"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { LiveTicker } from "@/components/live-ticker"

interface NavbarProps {
  walletAddress: string | null
  isConnected: boolean
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export function Navbar({ walletAddress, isConnected, onConnect, onDisconnect }: NavbarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { name: "Profit", path: "/" },
    { name: "Swap", path: "/swap" },
    { name: "Pre-Buy", path: "/pre-buy" },
  ]

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full"
    >
      <LiveTicker />
      <div className="glass border-b-0 border-x-0 relative overflow-hidden">
        {/* Animated gradient top border effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 font-bold text-xl group z-10">
              <motion.div 
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-black shadow-[0_0_15px_var(--primary)] text-lg"
              >
                ₿
              </motion.div>
              <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground font-extrabold tracking-tight">
                Crypto<span className="text-primary">Calc</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1 sm:gap-2 z-10 bg-background/40 p-1 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md">
              {navLinks.map((link) => {
                const active = isActive(link.path)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (
                  <Link href={link.path as any} key={link.path} className="relative">
                    <Button 
                      variant="ghost" 
                      className={`relative z-10 text-sm font-semibold transition-colors rounded-xl ${active ? 'text-primary-foreground' : 'text-foreground hover:text-primary'}`}
                    >
                      {link.name}
                    </Button>
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg -z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Profile or Wallet Connector */}
            <div className="flex-shrink-0 z-10">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {isConnected && walletAddress ? (
                  <ProfileDropdown walletAddress={walletAddress} onDisconnect={onDisconnect} />
                ) : (
                  <WalletConnector onConnect={onConnect} onDisconnect={onDisconnect} compact={true} />
                )}
              </motion.div>
            </div>
            
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
