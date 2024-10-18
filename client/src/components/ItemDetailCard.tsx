import { GameProgress, itemFullDisplayName, ItemStatus, ProgressionItem } from "../models"
import "./ItemDetailCard.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faStar } from "@fortawesome/free-solid-svg-icons"
import { markItemCompleted } from "../ApiInterface"
import { useProgressionItemsMapContext } from "../contexts/ProgressionItemsMapContext"

function ItemDetailCard(props: {
  status: ItemStatus;
  item: ProgressionItem;
  setGameProgress: (gp: GameProgress) => void;
  hypotheticals: string[] | undefined;
}) {
  const { status, item, setGameProgress, hypotheticals } = props

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

  let costText
  if (status == ItemStatus.Completed) {
    costText = null
  } else {
    const costTextStrings = []
    if (item.geo_cost) { costTextStrings.push(`Geo Price: ${item.geo_cost}`) }
    if (item.grub_cost) { costTextStrings.push(`Grubs Needed: ${item.grub_cost}`) }
    if (item.essence_cost) { costTextStrings.push(`Essence Needed: ${item.essence_cost}`) }
    costText = costTextStrings.length === 0 ? null : <p className="item-summary-text">{costTextStrings.join("\n")}</p>
  }

  const { progressionItemsMap } = useProgressionItemsMapContext()
  let hypotheticalsList
  if (hypotheticals && progressionItemsMap) {
    let hypotheticalsHeaderText
    if (status == ItemStatus.Locked) {
      hypotheticalsHeaderText = "Blockers:"
    } else if (status == ItemStatus.Available) {
      hypotheticalsHeaderText = "This will unlock:"
    } else {
      console.error(`Unexpected status ${status} for hypotheticals ${hypotheticals}`)
      hypotheticalsHeaderText = ""
    }
    const hypotheticalsDisplayNames = hypotheticals.map((otherItemId) => itemFullDisplayName(progressionItemsMap[otherItemId]))
    hypotheticalsDisplayNames.sort()
    hypotheticalsList = (
      <div className="hypotheticals">
        {hypotheticalsHeaderText}
        <ul>
          {hypotheticalsDisplayNames.map((otherItemName, index) => (
            <li key={index}>{otherItemName}</li>
          ))}
        </ul>
      </div>
    )
  } else {
    hypotheticalsList = null
  }

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
        <b>{itemFullDisplayName(item)}</b>
      </div>
      {costText}
      {hypotheticalsList}
    </div>
    {(status == ItemStatus.Available) ? completionButton : null}
  </div>
}

export default ItemDetailCard
