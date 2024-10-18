import { ReactNode, useState, useEffect } from "react"
import { getAllItemDefinitions } from "../ApiInterface"
import { ProgressionItemsMap } from "../models"
import { ProgressionItemsMapState, ProgressionItemsMapContextXXX } from "./ProgressionItemsMapContext"

export const ProgressionItemsMapContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ProgressionItemsMap | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate an async function that fetches data
  const fetchData = async (): Promise<ProgressionItemsMap> => {
    return getAllItemDefinitions()
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData()
        setData(result)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch item definitions")
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
    <ProgressionItemsMapContextXXX.Provider value={contextValue}>
      {children}
    </ProgressionItemsMapContextXXX.Provider>
  )
}
