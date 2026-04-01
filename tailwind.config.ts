// Tailwind CSS v4 uses CSS-first configuration via @import "tailwindcss" in globals.css.
// This file is kept as a placeholder for IDE tooling compatibility only.
// All theme configuration is in app/globals.css under @theme inline {...}
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
}

export default config
