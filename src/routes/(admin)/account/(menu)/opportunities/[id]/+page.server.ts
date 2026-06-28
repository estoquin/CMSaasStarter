import type { Actions } from "./$types"
import { detailLoad, updateAction, deleteDetailAction } from "$lib/crud.server"

export const load = detailLoad("opportunities")

export const actions: Actions = {
  update: updateAction("opportunities", { fields: ["name", "account_id", "value", "stage", "probability", "close_date", "notes"], required: ["name"], parse: { value: "float", probability: "int" }, nullables: ["account_id", "close_date", "notes"] }),
  delete: deleteDetailAction("opportunities", "/account/opportunities"),
}
