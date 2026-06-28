import type { Actions } from "./$types"
import { detailLoad, updateAction, deleteDetailAction } from "$lib/crud.server"

export const load = detailLoad("orders")

export const actions: Actions = {
  update: updateAction("orders", { fields: ["name", "account_id", "quote_id", "total", "status", "order_date", "notes"], required: ["name"], parse: { total: "float" }, nullables: ["account_id", "quote_id", "order_date", "notes"] }),
  delete: deleteDetailAction("orders", "/account/orders"),
}
