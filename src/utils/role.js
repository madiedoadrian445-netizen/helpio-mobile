// utils/role.js

import useAuthStore from "../store/auth";

export const isProvider = () => {
  const user = useAuthStore.getState().user;
  return !!user?.providerId;
};