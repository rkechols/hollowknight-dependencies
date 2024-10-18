import { ProgressionItemsMap, GameProgress } from "./models"

const API_URL_BASE = "/api"

function checkResponse(response: Response, expectedContentType: string = "application/json"): void {
  if (response.status >= 400) {
    throw new Error(`API response status code ${response.status}`)
  }
  const contentType = response.headers.get("Content-Type")
  if (contentType !== expectedContentType) {
    throw new Error(`Expected API response header 'Content-Type' to be ${expectedContentType}, but was ${contentType}`)
  }
}

export async function getAllItemDefinitions(): Promise<ProgressionItemsMap> {
  const response = await fetch(`${API_URL_BASE}/all-item-definitions`)
  checkResponse(response)
  return response.json()
}

export async function getCurrentProgress(): Promise<GameProgress> {
  const response = await fetch(`${API_URL_BASE}/current-progress`)
  checkResponse(response)
  return response.json()
}

export async function markItemCompleted(itemID: string): Promise<GameProgress> {
  const response = await fetch(`${API_URL_BASE}/mark-item-completed?progress_item_id=${itemID}`, { method: "POST" })
  checkResponse(response)
  return response.json()
}

export async function resetAllProgress(): Promise<GameProgress> {
  const response = await fetch(`${API_URL_BASE}/reset`, { method: "POST" })
  checkResponse(response)
  return response.json()
}
