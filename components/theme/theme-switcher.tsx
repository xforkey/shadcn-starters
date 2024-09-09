"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { useConfig } from "@/hooks/use-config"

export function ThemeSwitcher() {
  const [config] = useConfig()
  const segment = usePathname()

  React.useEffect(() => {
    document.body.classList.forEach((className) => {
      if (className.match(/^theme.*/)) {
        document.body.classList.remove(className)
      }
    })

    if (config.theme) {
      return document.body.classList.add(`theme-${config.theme}`)
    }
  }, [segment, config])

  return null
}
