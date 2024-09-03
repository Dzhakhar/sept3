import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Actor,
  getAllRecordsSorted,
  SortOrder,
  SortBy,
  updateActor,
  deleteActor,
} from "@utils/db";

export const actorsApi = createApi({
  reducerPath: "actorsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  tagTypes: ["actor"],
  endpoints: (builder) => ({
    getActors: builder.query<Actor[], { sortBy: SortBy; order: SortOrder }>({
      queryFn: async ({ sortBy, order }) => {
        const actors = await getAllRecordsSorted({ sortBy, order });
        return { data: actors };
      },
    }),
    updateActor: builder.mutation<void, Actor>({
      queryFn: async (actor) => {
        await updateActor(actor);
        return actor;
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(actorsApi.util.resetApiState());
        } catch {
          console.error("Error resetting the cache");
        }
      },
    }),
    deleteActor: builder.mutation<void, Actor>({
      queryFn: async (actor) => {
        await deleteActor(actor.id);
        return actor;
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(actorsApi.util.resetApiState());
        } catch {
          console.error("Error resetting the cache");
        }
      },
    }),
  }),
});

export const {
  useGetActorsQuery,
  useUpdateActorMutation,
  useDeleteActorMutation,
} = actorsApi;
