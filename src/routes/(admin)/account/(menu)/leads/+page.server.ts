import type { Actions } from "./$types"
import { listLoad, createAction, deleteAction } from "$lib/crud.server"

export const load = listLoad("leads")

export const actions: Actions = {
  create: createAction("leads", { fields: ["name", "email", "phone", "source", "notes"], required: ["name"], nullables: ["email", "phone", "source", "notes"] }),
  delete: deleteAction("leads"),
}
