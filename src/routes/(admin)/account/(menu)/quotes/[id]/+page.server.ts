import type { Actions } from "./$types"
import { detailLoad, updateAction, deleteDetailAction } from "$lib/crud.server"

export const load = detailLoad("quotes")

export const actions: Actions = {
  update: updateAction("quotes", { fields: ["name", "account_id", "opportunity_id", "total", "status", "valid_until", "notes"], required: ["name"], parse: { total: "float" }, nullables: ["account_id", "opportunity_id", "valid_until", "notes"] }),
  delete: deleteDetailAction("quotes", "/account/quotes"),
}
