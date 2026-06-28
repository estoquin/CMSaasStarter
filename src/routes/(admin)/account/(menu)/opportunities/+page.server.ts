import type { Actions } from "./$types"
import { listLoad, createAction, deleteAction } from "$lib/crud.server"

export const load = listLoad("opportunities", { select: "*, accounts(name)" })

export const actions: Actions = {
  create: createAction("opportunities", { fields: ["name", "account_id", "value", "stage", "probability", "close_date", "notes"], required: ["name"], parse: { value: "float", probability: "int" }, nullables: ["account_id", "close_date", "notes"] }),
  delete: deleteAction("opportunities"),
}
