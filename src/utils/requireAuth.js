export const requireAuth = ({
  token,
  navigation,
  redirectTo,
  params = {},
}) => {
  if (!token) {
    console.log("🚨 NO TOKEN - redirecting to login");

    const rootNav =
      navigation.getParent?.()?.getParent?.() || navigation;

    rootNav.navigate("LoginScreen", {
      redirectTo,
      params,
    });

    return false;
  }

  return true;
};