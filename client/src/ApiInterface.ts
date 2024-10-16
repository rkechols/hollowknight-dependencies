import { ProgressionItemsMap, GameProgress } from "./models";

const API_URL_BASE = '/api';

export async function getAllItemDefinitions(): Promise<ProgressionItemsMap> {
  const response = await fetch(`${API_URL_BASE}/all-item-definitions`);
  return response.json();
}

export async function getCurrentProgress(): Promise<GameProgress> {
  const response = await fetch(`${API_URL_BASE}/current-progress`);
  return response.json();
}
