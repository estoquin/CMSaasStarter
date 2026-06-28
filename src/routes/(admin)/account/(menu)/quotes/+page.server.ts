import type { Actions } from "./$types"
import { listLoad, createAction, deleteAction } from "$lib/crud.server"

export const load = listLoad("quotes", { select: "*, accounts(name)" })

export const actions: Actions = {
  create: createAction("quotes", { fields: ["name", "account_id", "opportunity_id", "total", "status", "valid_until", "notes"], required: ["name"], parse: { total: "float" }, nullables: ["account_id", "opportunity_id", "valid_until", "notes"] }),
  delete: deleteAction("quotes"),
}
