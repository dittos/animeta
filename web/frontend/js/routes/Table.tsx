import { Loader } from '../../../shared/loader';
import { type RouteHandler } from '../routes';
import { GetCurrentTablePeriodDocument } from './__generated__/Table.graphql';

export default {
  load: async ({ redirect, loader }) => {
    const result = await loader.graphql(GetCurrentTablePeriodDocument)
    return redirect(`/table/${result.currentTablePeriod.period}/`)
  },
} satisfies RouteHandler<Loader>;
