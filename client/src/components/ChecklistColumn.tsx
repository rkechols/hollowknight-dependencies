import { GameProgress, ItemStatus, itemStatusToString, ProgressionItem } from "../models"
import ItemDetailCard from "./ItemDetailCard"
import "./ChecklistColumn.css"

function ChecklistColumn(props: {
  status: ItemStatus;
  checklistItems: ProgressionItem[];
  setGameProgress: (gp: GameProgress) => void;
}) {
  const { status, checklistItems, setGameProgress } = props

  let content
  if (checklistItems.length === 0) {
    content = <p>(None)</p>
  } else {
    content = (
      <div className="checklist-column">
        {checklistItems.map((item, index) => (
          <ItemDetailCard key={index} status={status} item={item} setGameProgress={setGameProgress}/>
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
