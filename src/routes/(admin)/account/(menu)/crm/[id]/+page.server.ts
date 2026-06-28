import type { Actions } from "./$types"
import { detailLoad, updateAction, deleteDetailAction } from "$lib/crud.server"

export const load = detailLoad("contacts")

export const actions: Actions = {
  update: updateAction("contacts", { fields: ["name", "email", "phone", "company", "notes", "status"], required: ["name"], nullables: ["email", "phone", "company", "notes"] }),
  delete: deleteDetailAction("contacts", "/account/crm"),
}
