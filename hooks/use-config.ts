import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { Theme } from "@/components/theme/themes"
import { Style } from "@/components/theme/styles"

type Config = {
  style: Style["name"]
  theme: Theme["name"]
  radius: number
}

const configAtom = atomWithStorage<Config>("config", {
  style: "default",
  theme: "zinc",
  radius: 0.5,
})

export function useConfig() {
  return useAtom(configAtom)
}
