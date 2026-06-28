import type { Actions } from "./$types"
import { detailLoad, updateAction, deleteDetailAction } from "$lib/crud.server"

export const load = detailLoad("leads")

export const actions: Actions = {
  update: updateAction("leads", { fields: ["name", "email", "phone", "source", "status", "notes"], required: ["name"], nullables: ["email", "phone", "source", "notes"] }),
  delete: deleteDetailAction("leads", "/account/leads"),
}
