import { GameProgress, ItemStatus, ItemType, itemTypeToString, ProgressionItem } from "../models"
import "./ItemDetailCard.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faStar } from "@fortawesome/free-solid-svg-icons"
import { markItemCompleted } from "../ApiInterface"

function ItemDetailCard(props: {
  status: ItemStatus;
  item: ProgressionItem;
  setGameProgress: (gp: GameProgress) => void;
}) {
  const { status, item, setGameProgress } = props

  const onClickCompleted = async () => {
    let result
    try {
      result = await markItemCompleted(item.id)
    } catch (err) {
      console.error(`Failed to mark item ${item.id} as completed - ${err}`)
      return
    }
    setGameProgress(result)
  }

  const requiredIcon = item.required ? <FontAwesomeIcon icon={faStar} className="required-icon" /> : null

  let displayName = item.display_name
  if (item.item_type == itemTypeToString(ItemType.Charm) || item.item_type == itemTypeToString(ItemType.Boss)) {
    displayName = `${item.item_type} - ${displayName}`
  }

  const costTexts = []
  if (item.geo_cost) { costTexts.push(`Geo Price: ${item.geo_cost}`) }
  if (item.grub_cost) { costTexts.push(`Grubs Needed: ${item.grub_cost}`) }
  if (item.essence_cost) { costTexts.push(`Essence Needed: ${item.essence_cost}`) }
  const summaryText = costTexts.length === 0 ? null : <p className="item-summary-text">{costTexts.join("\n")}</p>

  const completionButton = (
    <button className="completion-button" onClick={onClickCompleted}>
      <FontAwesomeIcon icon={faCheckCircle}/>
    </button>
  )

  const mainDivClassname = "item-detail-card" + (item.required ? " item-detail-card-required" : "")
  return <div className={mainDivClassname}>
    <div className="item-detail-card-contents">
      <div className="item-detail-card-contents-header">
        {requiredIcon}
        <b>{displayName}</b>
      </div>
      {summaryText}
    </div>
    {(status == ItemStatus.Available) ? completionButton : null}
  </div>
}

export default ItemDetailCard
