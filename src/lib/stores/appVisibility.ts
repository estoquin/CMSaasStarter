import { writable } from "svelte/store"

const STORAGE_KEY = "appVisibility"

function load(): { crm: boolean; erp: boolean; costCalculator: boolean; service: boolean; habits: boolean } {
  if (typeof localStorage === "undefined") return { crm: true, erp: true, costCalculator: true, service: true, habits: true }
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : { crm: true, erp: true, costCalculator: true, service: true, habits: true }
}

function save(value: { crm: boolean; erp: boolean; costCalculator: boolean; service: boolean; habits: boolean }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export const appVisibility = writable(load())

appVisibility.subscribe((value) => {
  if (typeof localStorage !== "undefined") save(value)
})
