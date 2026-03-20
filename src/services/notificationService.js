import * as Notifications from "expo-notifications";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});



export function registerNotificationListeners(navigation) {
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {

      const data = response.notification.request.content.data;

      console.log("🔔 Notification tapped:", data);

      if (!data) return;

      // 🔒 navigation safety guard
    if (!navigation?.isReady?.()) return;

      switch (data.type) {
        case "chat":
          navigation.navigate("ChatDetail", {
            conversationId: data.conversationId,
          });
          break;

        case "payment":
          navigation.navigate("HelpioReceipt", {
            paymentId: data.paymentId,
          });
          break;

        case "booking":
          navigation.navigate("ServiceDetailScreen", {
            serviceId: data.serviceId,
          });
          break;

        default:
          console.log("Unknown notification type");
      }

    });

  return () => responseListener.remove();
}