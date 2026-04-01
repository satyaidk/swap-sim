"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { getUserProfile, type UserProfile } from "@/lib/user-storage"

interface ProfileDropdownProps {
  walletAddress: string | null
  onDisconnect: () => void
}

export function ProfileDropdown({ walletAddress, onDisconnect }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (walletAddress) {
      const userProfile = getUserProfile(walletAddress)
      setProfile(userProfile)
    }
  }, [walletAddress])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!walletAddress) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
      >
        {profile?.pfpUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.pfpUrl || "/placeholder.svg"} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {profile?.name?.charAt(0) || "U"}
          </div>
        )}
        <span className="text-xs font-semibold text-foreground hidden sm:inline">{profile?.name || "User"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 animate-slide-up">
          <div className="p-4 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
            <p className="text-xs font-mono text-foreground break-all font-semibold">{walletAddress}</p>
          </div>

          <div className="p-2 space-y-1">
            <Link href="/profile">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded transition-colors"
              >
                View Profile
              </button>
            </Link>

            <Link href="/settings">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded transition-colors"
              >
                Settings
              </button>
            </Link>

            <button
              onClick={() => {
                onDisconnect()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
