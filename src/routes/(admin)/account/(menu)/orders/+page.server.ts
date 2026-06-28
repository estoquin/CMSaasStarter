import type { Actions } from "./$types"
import { listLoad, createAction, deleteAction } from "$lib/crud.server"

export const load = listLoad("orders", { select: "*, accounts(name)" })

export const actions: Actions = {
  create: createAction("orders", { fields: ["name", "account_id", "quote_id", "total", "status", "order_date", "notes"], required: ["name"], parse: { total: "float" }, nullables: ["account_id", "quote_id", "order_date", "notes"] }),
  delete: deleteAction("orders"),
}
