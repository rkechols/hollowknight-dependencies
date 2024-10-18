import { useCallback, useEffect, useState } from "react"
import ChecklistColumn from "./ChecklistColumn"
import "./DependencyChecklist.css"
import { GameProgress, ItemStatus, ProgressionItemsMap } from "../models"
import { getCurrentProgress, resetAllProgress } from "../ApiInterface"
import { useProgressionItemsMapContext } from "../contexts/ProgressionItemsMapContext"
import Popup from "./Popup"

function DependencyChecklistColumns(props: {
  progressionItemsMap: ProgressionItemsMap;
  gameProgress: GameProgress;
}) {
  const { progressionItemsMap, gameProgress } = props

  // sort items into columns
  const lockedItems = gameProgress.items_locked.map((id) => progressionItemsMap[id])
  const availableItems = gameProgress.items_available.map((id) => progressionItemsMap[id])
  const completedItems = gameProgress.items_completed.map((id) => progressionItemsMap[id])

  return (
    <div className="columns-box">
      <div className="column"><ChecklistColumn
        status={ItemStatus.Locked}
        checklistItems={lockedItems}
      /></div>
      <div className="column"><ChecklistColumn
        status={ItemStatus.Available}
        checklistItems={availableItems}
      /></div>
      <div className="column"><ChecklistColumn
        status={ItemStatus.Completed}
        checklistItems={completedItems}
      /></div>
    </div>
  )
}


function DependencyChecklist() {
  const progressionItemsMapContext = useProgressionItemsMapContext()
  const { progressionItemsMap } = progressionItemsMapContext

  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null)
  const [loadingGameProgress, setLoadingGameProgress] = useState<boolean>(true)
  const [gameProgressError, setGameProgressError] = useState<string | null>(null)

  const getGameProgress = async () => {
    setLoadingGameProgress(true)
    try {
      const result = await getCurrentProgress()
      setGameProgress(result)
    } catch (err) {
      const errorMessage = "Failed to get current game progress"
      console.error(`${errorMessage} - ${err}`)
      setGameProgressError(errorMessage)
    } finally {
      setLoadingGameProgress(false)
    }
  }

  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false)
  const refresh = () => {
    setRefreshTrigger((prev) => !prev)  // Toggle refreshTrigger to trigger re-fetch
  }

  const resetGameProgress = async () => {
    setLoadingGameProgress(true)
    try {
      const result = await resetAllProgress()
      setGameProgress(result)
    } catch (err) {
      const errorMessage = "Error while resetting game progress"
      console.error(`${errorMessage} - ${err}`)
      setGameProgressError(errorMessage)
    } finally {
      setLoadingGameProgress(false)
    }
  }

  const [resetConfirmationIsOpen, setResetConfirmationIsOpen] = useState<boolean>(false)
  const openResetConfirmation = () => { setResetConfirmationIsOpen(true) }

  useEffect(() => {
    getGameProgress()
  }, [refreshTrigger])  // Refresh data whenever 'refreshTrigger' state changes

  let isBusy = false
  let content
  if (progressionItemsMapContext.loading) {
    content = <p>Loading item definitions...</p>
    isBusy = true
  } else if (loadingGameProgress) {
    content = <p>Loading current game progress...</p>
    isBusy = true
  } else if (progressionItemsMapContext.error || progressionItemsMap === null) {
    content = <p>{progressionItemsMapContext.error || "Failed to get item definitions"}</p>
  } else if (gameProgressError || gameProgress === null) {
    content = <p>{gameProgressError || "Failed to get current game progress"}</p>
  } else {
    content = <DependencyChecklistColumns
      progressionItemsMap={progressionItemsMap}
      gameProgress={gameProgress}
    />
  }

  const refreshButton = <button onClick={refresh}>Refresh</button>
  const resetButton = <button onClick={openResetConfirmation}>Reset</button>

  const buttonsArray = isBusy ? null : (
    <div className="main-buttons-array">
      {refreshButton}
      {resetButton}
    </div>
  )

  const dismissPopup = useCallback(() => { setResetConfirmationIsOpen(false) }, [])
  const confirmPopup = useCallback(async () => {
    setResetConfirmationIsOpen(false)
    await resetGameProgress()
  }, [])
  let resetConfirmationPopup
  if (resetConfirmationIsOpen) {
    resetConfirmationPopup = <Popup
      title="Reset Game Progress"
      bodyText="Are you sure you want to reset all game progress data?"
      buttonSpecDismiss={{
        text: "Cancel",
        onClick: dismissPopup,
      }}
      buttonSpecConfirm={{
        text: "Reset All Data",
        onClick: confirmPopup,
      }}
    />
  } else {
    resetConfirmationPopup = null
  }

  return (
    <>
      <div>
        <h1>Hollow Knight - Dependency Checklist</h1>
        {buttonsArray}
        {content}
        {resetConfirmationPopup}
      </div>
    </>
  )
}

export default DependencyChecklist
