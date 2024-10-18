import { ItemStatus, itemStatusToString, ProgressionItem } from "../models"
import ItemDetailCard from "./ItemDetailCard"

function ChecklistColumn(props: {
  status: ItemStatus;
  checklistItems: ProgressionItem[];
}) {
  const { status, checklistItems } = props

  let content
  if (checklistItems.length === 0) {
    content = <p>(None)</p>
  } else {
    content = (
      <div>
        {checklistItems.map((item, index) => (
          <ItemDetailCard key={index} status={status} item={item}/>
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
