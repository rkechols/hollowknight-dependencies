import { createContext, useContext } from "react"
import { ProgressionItemsMap } from "../models"

export interface ProgressionItemsMapState {
  progressionItemsMap: ProgressionItemsMap | null
  loading: boolean
  error: string | null
}

export const ProgressionItemsMapContextXXX = createContext<ProgressionItemsMapState | undefined>(undefined)

export function useProgressionItemsMapContext(): ProgressionItemsMapState {
  const context = useContext(ProgressionItemsMapContextXXX)
  if (context === undefined) {
    throw new Error("useProgressionItemsMapContext must be used within a ProgressionItemsMapContextProvider")
  }
  return context
}
