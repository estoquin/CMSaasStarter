import type { Actions } from "./$types"
import { listLoad, createAction, deleteAction } from "$lib/crud.server"

export const load = listLoad("contacts")

export const actions: Actions = {
  create: createAction("contacts", { fields: ["name", "email", "phone", "company", "notes"], required: ["name"], nullables: ["email", "phone", "company", "notes"] }),
  delete: deleteAction("contacts"),
}
