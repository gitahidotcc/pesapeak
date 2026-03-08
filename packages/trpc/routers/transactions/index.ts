import { router } from "../../index";
import { list } from "./list";
import { summary } from "./summary";
import { periods } from "./periods";
import { create } from "./create";
import { update } from "./update";
import { deleteProcedure } from "./delete";
import { locationSuggestions } from "./location-suggestions";

export const transactionsRouter = router({
  list,
  summary,
  periods,
  create,
  update,
  delete: deleteProcedure,
  locationSuggestions,
});
