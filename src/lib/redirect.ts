import { redirect } from "@tanstack/react-router";
import { RETURNING_USER_STORAGE_KEY } from "app-constants";
import { getDefaultStore } from "jotai";
import { authSessionAtom } from "store/keyring";

export const handleInitialAppRedirect = () => {
  const store = getDefaultStore();
  const session = store.get(authSessionAtom);
  if (session) {
    throw redirect({ to: "/dashboard", replace: true });
  }
  const isReturningUser = localStorage.getItem(RETURNING_USER_STORAGE_KEY);
  throw redirect({
    to: isReturningUser ? "/login" : "/sign-up",
    replace: true,
  });
};
