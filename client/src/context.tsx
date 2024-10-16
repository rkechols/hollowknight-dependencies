import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ProgressionItemsMap } from "./models";
import { getAllItemDefinitions } from "./ApiInterface";

export interface ProgressionItemsMapContext {
  progressionItemsMap: ProgressionItemsMap | null;
  loading: boolean;
  error: string | null; 
}

const progressionItemsMapContext = createContext<ProgressionItemsMapContext | undefined>(undefined);

export function useProgressionItemsMapContext(): ProgressionItemsMapContext {
  const context = useContext(progressionItemsMapContext);
  if (context === undefined) {
    throw new Error('useProgressionItemsMapContext must be used within a ProgressionItemsMapContextProvider');
  }
  return context;
}

// Define the provider component
export const ProgressionItemsMapContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ProgressionItemsMap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate an async function that fetches data
  const fetchData = async (): Promise<ProgressionItemsMap> => {
    return getAllItemDefinitions();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch item definitions');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);  // Empty dependency array ensures this runs only once

  const contextValue: ProgressionItemsMapContext = {
    progressionItemsMap: data,
    loading,
    error,
  };

  return (
    <progressionItemsMapContext.Provider value={contextValue}>
      {children}
    </progressionItemsMapContext.Provider>
  );
};
