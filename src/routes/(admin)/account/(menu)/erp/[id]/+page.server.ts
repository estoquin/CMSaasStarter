import type { Actions } from "./$types"
import { detailLoad, updateAction, deleteDetailAction } from "$lib/crud.server"

export const load = detailLoad("products")

export const actions: Actions = {
  update: updateAction("products", { fields: ["name", "sku", "price", "stock", "description"], required: ["name"], parse: { price: "float", stock: "int" }, nullables: ["sku", "description"] }),
  delete: deleteDetailAction("products", "/account/erp"),
}
