import { configureStore } from "@reduxjs/toolkit";
import { actorsApi } from "@services/actors";

export const store = configureStore({
  reducer: {
    [actorsApi.reducerPath]: actorsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(actorsApi.middleware),
});
