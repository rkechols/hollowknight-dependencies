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
  "Pale Ore",
  "Path",
  "Shop",
  "Simple Key",
  "Singleton",
  "Stag Station",
  "Upgrade",
}

export type PrerequisiteSpec = string[] | string

export interface ProgressionItem {
  id: string
  display_name: string
  item_type: ItemType
  geo_cost: number | null
  grub_cost: number | null
  essence_cost: number | null
  prerequisites: PrerequisiteSpec
  required: boolean
}

export interface ProgressionItemsMap {
  [id: string]: ProgressionItem
}

export interface GameProgress {
  items_locked: string[]
  items_available: string[]
  items_completed: string[]
}
