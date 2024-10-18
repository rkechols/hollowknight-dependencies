import { GameProgress, ItemStatus, ProgressionItem } from "../models"
import "./ItemDetailCard.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons"
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

  const completionButton = (
    <button className="completion-button" onClick={onClickCompleted}>
      <FontAwesomeIcon icon={faCheckCircle}/>
    </button>
  )

  return <div className="item-detail-card">
    <div className="item-detail-card-contents">
      <p className="text-align-start">{item.display_name}</p>
    </div>
    {(status == ItemStatus.Available) ? completionButton : null}
  </div>
}

export default ItemDetailCard
