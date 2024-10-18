import { ReactNode, useState, useEffect } from "react"
import { getAllItemDefinitions } from "../ApiInterface"
import { ProgressionItemsMap } from "../models"
import { ProgressionItemsMapState, ProgressionItemsMapContext } from "./ProgressionItemsMapContext"

export const ProgressionItemsMapContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ProgressionItemsMap | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getAllItemDefinitions()
        setData(result)
      } catch (err) {
        const errorMessage = "Failed to get item definitions"
        console.error(`${errorMessage} - ${err}`)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])  // Empty dependency array ensures this runs only once

  const contextValue: ProgressionItemsMapState = {
    progressionItemsMap: data,
    loading,
    error,
  }

  return (
    <ProgressionItemsMapContext.Provider value={contextValue}>
      {children}
    </ProgressionItemsMapContext.Provider>
  )
}
