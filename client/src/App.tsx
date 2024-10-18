import "./App.css"
import DependencyChecklist from "./components/DependencyChecklist"
import { ProgressionItemsMapContextProvider } from "./contexts/ProgressionItemsMapContextProvider"

function App() {
  return (
    <>
      <ProgressionItemsMapContextProvider>
        <DependencyChecklist />
      </ProgressionItemsMapContextProvider>
    </>
  )
}

export default App
