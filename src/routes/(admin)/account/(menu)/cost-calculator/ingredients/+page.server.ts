import type { Actions } from "./$types"
import { listLoad, createAction, deleteAction } from "$lib/crud.server"

export const load = listLoad("ingredients", { orderBy: "name" })

export const actions: Actions = {
  create: createAction("ingredients", { fields: ["name", "unit"], required: ["name", "unit"] }),
  delete: deleteAction("ingredients"),
}
