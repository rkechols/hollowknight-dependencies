import { GameProgress, ItemStatus, itemStatusToString, ProgressionItem } from "../models"
import ItemDetailCard from "./ItemDetailCard"
import "./ChecklistColumn.css"

function ChecklistColumn(props: {
  status: ItemStatus;
  checklistItems: ProgressionItem[];
  setGameProgress: (gp: GameProgress) => void;
  hypotheticals: { [id: string]: string[] } | null;
}) {
  const { status, checklistItems, setGameProgress, hypotheticals } = props

  let hypotheticalsPrepared: { [id: string]: string[] }
  if (hypotheticals && status == ItemStatus.Available) {
    hypotheticalsPrepared = hypotheticals
  } else if (hypotheticals && status == ItemStatus.Locked) {
    // invert `hypotheticals`:
    //   rather than [availableId] -> unlockableIds,
    //   it becomes [unlockableId] -> availableIds
    const hypotheticalsPreparedSets: { [id: string]: Set<string> } = {}
    for (const availableID of Object.keys(hypotheticals)) {
      for (const unlockableId of hypotheticals[availableID]) {
        const existing = hypotheticalsPreparedSets[unlockableId] || new Set<string>()
        existing.add(availableID)
        hypotheticalsPreparedSets[unlockableId] = existing
      }
    }
    hypotheticalsPrepared = {}
    for (const unlockableId of Object.keys(hypotheticalsPreparedSets)) {
      hypotheticalsPrepared[unlockableId] = Array.from(hypotheticalsPreparedSets[unlockableId])
    }
  } else {
    hypotheticalsPrepared = {}
  }

  let content
  if (checklistItems.length === 0) {
    content = <p>(None)</p>
  } else {
    content = (
      <div className="checklist-column">
        {checklistItems.map((item, index) => (
          <ItemDetailCard
            key={index}
            status={status}
            item={item}
            setGameProgress={setGameProgress}
            hypotheticals={hypotheticalsPrepared[item.id]}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <h2>{itemStatusToString(status)}</h2>
      {content}
    </>
  )
}

export default ChecklistColumn
