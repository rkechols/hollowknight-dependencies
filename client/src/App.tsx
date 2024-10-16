import './App.css'
import DependencyChecklist from './components/DependencyChecklist'
import { ProgressionItemsMapContextProvider } from './context'

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
