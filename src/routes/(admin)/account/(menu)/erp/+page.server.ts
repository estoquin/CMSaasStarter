import type { Actions } from "./$types"
import { listLoad, createAction, deleteAction } from "$lib/crud.server"

export const load = listLoad("products")

export const actions: Actions = {
  create: createAction("products", { fields: ["name", "sku", "price", "stock", "description"], required: ["name"], parse: { price: "float", stock: "int" }, nullables: ["sku", "description"] }),
  delete: deleteAction("products"),
}
