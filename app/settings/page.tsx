 "use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { getUserProfile, createOrUpdateUserProfile } from "@/lib/user-storage"

export default function SettingsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [pfpUrl, setPfpUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (walletAddress) {
      const profile = getUserProfile(walletAddress)
      if (profile) {
        setName(profile.name)
        setPfpUrl(profile.pfpUrl || "")
      }
    }
  }, [walletAddress])

  if (!mounted) return null

  const handleSaveProfile = async () => {
    if (!walletAddress) return

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    createOrUpdateUserProfile(walletAddress, {
      name: name || `User ${walletAddress.slice(0, 6)}`,
      pfpUrl: pfpUrl || null,
    })

    setSaveMessage("Profile updated successfully!")
    setIsSaving(false)
    setTimeout(() => setSaveMessage(""), 3000)
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
        {isConnected && walletAddress ? (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card border-border">
              <div className="p-6 md:p-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                <p className="text-muted-foreground mb-8">Customize your profile</p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-foreground font-semibold">
                      Display Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your display name"
                      className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pfp" className="text-foreground font-semibold">
                      Profile Picture URL
                    </Label>
                    <Input
                      id="pfp"
                      value={pfpUrl}
                      onChange={(e) => setPfpUrl(e.target.value)}
                      placeholder="Enter image URL for your profile picture"
                      className="mt-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                    {pfpUrl && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pfpUrl || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-20 h-20 rounded-full object-cover border border-border"
                          onError={() => setPfpUrl("")}
                        />
                      </div>
                    )}
                  </div>

                  {saveMessage && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">{saveMessage}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card className="bg-card border-border">
              <div className="p-8 text-center space-y-4">
                <div className="text-5xl">🔐</div>
                <p className="text-muted-foreground">Connect your wallet to access settings</p>
                <p className="text-xs text-muted-foreground">Use the Connect button in the top right to get started</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
