export enum ItemStatus {
  Locked,
  Available,
  Completed,
}

export function itemStatusToString(itemStatus: ItemStatus): string {
  return ItemStatus[itemStatus]
}

export enum ItemType {
  "Ability",
  "Boss",
  "Charm",
  "Map",
  "Mask Shard",
  "Pale Ore",
  "Path",
  "Shop",
  "Simple Key",
  "Singleton",
  "Stag Station",
  "Upgrade",
  "Vessel Fragment",
}

export function itemTypeToString(itemType: ItemType): string {
  return ItemType[itemType]
}

export type PrerequisiteSpec = string[] | string

export interface ProgressionItem {
  id: string
  display_name: string
  item_type: string
  geo_cost: number | null
  grub_cost: number | null
  essence_cost: number | null
  prerequisites: PrerequisiteSpec
  required: boolean
  percentage_value: number | null
  auto_trigger: boolean
}

export function itemFullDisplayName(item: ProgressionItem): string {
  let displayName = item.display_name
  if (item.item_type == itemTypeToString(ItemType.Charm) || item.item_type == itemTypeToString(ItemType.Boss)) {
    displayName = `${item.item_type} - ${displayName}`
  }
  if (item.percentage_value) {
    displayName += ` - ${item.percentage_value}%`
  }
  return displayName
}

export interface ProgressionItemsMap {
  [id: string]: ProgressionItem
}

export interface GameProgress {
  items_locked: string[]
  items_available: string[]
  items_completed: string[]
  hypotheticals: { [id: string]: string[] }
}
