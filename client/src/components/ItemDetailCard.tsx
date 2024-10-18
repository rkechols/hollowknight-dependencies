import { ItemStatus, itemStatusToString, ProgressionItem } from "../models"

function ItemDetailCard(props: {
  status: ItemStatus;
  item: ProgressionItem;
}) {
  const { status, item } = props
  const description = `${item.display_name} (${itemStatusToString(status)})`
  return <div>
    <p>{description}</p>
  </div>
}

export default ItemDetailCard
