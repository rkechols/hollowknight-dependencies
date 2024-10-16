import { useEffect, useState } from "react";
import { useProgressionItemsMapContext } from "../../context";
import ChecklistColumn from "./ChecklistColumn";
import './DependencyChecklist.css';
import { GameProgress, ProgressionItemsMap } from "../../models";
import { getCurrentProgress } from "../../ApiInterface";

function DependencyChecklistColumns(props: {
  progressionItemsMap: ProgressionItemsMap;
  gameProgress: GameProgress;
}) {
  const { progressionItemsMap, gameProgress } = props;

  // sort items into columns
  const lockedItems = gameProgress.items_locked.map((id) => progressionItemsMap[id]);
  const availableItems = gameProgress.items_available.map((id) => progressionItemsMap[id]);
  const completedItems = gameProgress.items_completed.map((id) => progressionItemsMap[id]);

  return (
    <div className="row">
      <div className="column"><ChecklistColumn
        title="Locked"
        checklistItems={lockedItems}
      /></div>
      <div className="column"><ChecklistColumn
        title="Available"
        checklistItems={availableItems}
      /></div>
      <div className="column"><ChecklistColumn
        title="Completed"
        checklistItems={completedItems}
      /></div>
    </div>
  );
}


function DependencyChecklist() {
  const progressionItemsMapContext = useProgressionItemsMapContext();
  const { progressionItemsMap } = progressionItemsMapContext;

  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [loadingGameProgress, setLoadingGameProgress] = useState<boolean>(true);
  const [gameProgressError, setGameProgressError] = useState<string | null>(null);

  const getGameProgress = async () => {
    setLoadingGameProgress(true);
    try {
      const result = await getCurrentProgress();
      setGameProgress(result);
    } catch (err) {
      console.error(err);
      setGameProgressError('Failed to fetch current game progress');
    } finally {
      setLoadingGameProgress(false);
    }
  };

  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const refresh = () => {
    setRefreshTrigger((prev) => !prev);  // Toggle refreshTrigger to trigger re-fetch
  };

  useEffect(() => {
    getGameProgress();
  }, [refreshTrigger]);  // Refresh data whenever 'refreshTrigger' state changes

  let canRefresh = true;
  let content;
  if (progressionItemsMapContext.loading || progressionItemsMap === null) {
    content = <p>Loading item definitions...</p>;
    canRefresh = false;
  } else if (progressionItemsMapContext.error) {
    content = <p>Error loading item definitions: {progressionItemsMapContext.error}</p>
  } else if (loadingGameProgress || gameProgress === null) {
    content = <p>Loading current game progress...</p>;
    canRefresh = false;
  } else if (gameProgressError) {
    content = <p>Error loading current game progress: {gameProgressError}</p>;
  } else {
    content = <DependencyChecklistColumns
      progressionItemsMap={progressionItemsMap}
      gameProgress={gameProgress}
    />;
  }

  const refreshButton = canRefresh ? <button onClick={refresh}>Refresh</button> : null;

  return (
    <div>
      <h1>Hollow Knight - Dependency Checklist</h1>
      {refreshButton}
      {content}
    </div>
  );
}

export default DependencyChecklist;
