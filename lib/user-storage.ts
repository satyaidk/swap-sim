// User profile and saved calculations storage utility
export interface UserProfile {
  walletAddress: string
  name: string
  pfpUrl: string | null
  createdAt: string
}

export interface SavedCalculation {
  id: string
  type: "profit" | "swap" | "prebuy"
  data: Record<string, unknown>
  result: Record<string, unknown>
  createdAt: string
  name?: string
}

const USER_STORAGE_KEY = "crypto_user_profile"
const SAVED_CALCULATIONS_KEY = "crypto_saved_calculations"

export function getUserProfile(walletAddress: string): UserProfile | null {
  if (typeof window === "undefined") return null

  const profiles = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "{}")
  return profiles[walletAddress] || null
}

export function createOrUpdateUserProfile(
  walletAddress: string,
  updates: Partial<Omit<UserProfile, "walletAddress" | "createdAt">>,
): UserProfile {
  if (typeof window === "undefined") throw new Error("Storage not available")

  const profiles = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "{}")
  const existing = profiles[walletAddress]

  const profile: UserProfile = {
    walletAddress,
    name: updates.name || existing?.name || `User ${walletAddress.slice(0, 6)}`,
    pfpUrl: updates.pfpUrl !== undefined ? updates.pfpUrl : existing?.pfpUrl || null,
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

  profiles[walletAddress] = profile
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profiles))

  return profile
}

export function getSavedCalculations(walletAddress: string): SavedCalculation[] {
  if (typeof window === "undefined") return []

  const allCalculations = JSON.parse(localStorage.getItem(SAVED_CALCULATIONS_KEY) || "{}")
  return allCalculations[walletAddress] || []
}

export function saveCalculation(
  walletAddress: string,
  type: "profit" | "swap" | "prebuy",
  data: Record<string, unknown>,
  result: Record<string, unknown>,
  name?: string,
): SavedCalculation {
  if (typeof window === "undefined") throw new Error("Storage not available")

  const allCalculations = JSON.parse(localStorage.getItem(SAVED_CALCULATIONS_KEY) || "{}")
  if (!allCalculations[walletAddress]) {
    allCalculations[walletAddress] = []
  }

  const calculation: SavedCalculation = {
    id: Date.now().toString(),
    type,
    data,
    result,
    createdAt: new Date().toISOString(),
    name: name || `${type} - ${new Date().toLocaleDateString()}`,
  }

  allCalculations[walletAddress].push(calculation)
  localStorage.setItem(SAVED_CALCULATIONS_KEY, JSON.stringify(allCalculations))

  return calculation
}

export function deleteSavedCalculation(walletAddress: string, calculationId: string): void {
  if (typeof window === "undefined") return

  const allCalculations = JSON.parse(localStorage.getItem(SAVED_CALCULATIONS_KEY) || "{}")
  if (allCalculations[walletAddress]) {
    allCalculations[walletAddress] = allCalculations[walletAddress].filter(
      (calc: SavedCalculation) => calc.id !== calculationId,
    )
    localStorage.setItem(SAVED_CALCULATIONS_KEY, JSON.stringify(allCalculations))
  }
}

export function clearAllSavedCalculations(walletAddress: string): void {
  if (typeof window === "undefined") return

  const allCalculations = JSON.parse(localStorage.getItem(SAVED_CALCULATIONS_KEY) || "{}")
  delete allCalculations[walletAddress]
  localStorage.setItem(SAVED_CALCULATIONS_KEY, JSON.stringify(allCalculations))
}
