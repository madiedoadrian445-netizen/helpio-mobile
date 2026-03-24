// App.js
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  Text,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./src/navigation/navigationRef";


import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { ThemeProvider, useTheme } from "./src/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useAuthStore from "./src/store/auth";
import { DeviceEventEmitter } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
// Screens
import ClientDetailScreen from "./src/screens/ClientDetailScreen";
import ClientProfileScreen from "./src/screens/ClientProfileScreen";
import InvoicesHomeScreen from "./src/screens/InvoicesHomeScreen";
import ClientsScreen from "./src/screens/ClientsScreen";
import AddClientScreen from "./src/screens/AddClientScreen";
import InvoiceBuilderScreen from "./src/screens/InvoiceBuilderScreen";
import SubscriptionPlansScreen from "./src/screens/SubscriptionPlansScreen";
import InvoicePreviewScreen from "./src/screens/InvoicePreviewScreen";
import AllServicesScreen from "./src/screens/AllServicesScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import MenuScreen from "./src/screens/MenuScreen";
import ChatDetailScreen from "./src/screens/ChatDetailScreen";
import ServiceDetailScreen from "./src/screens/ServiceDetailScreen";
import ImagePreviewScreen from "./src/screens/ImagePreviewScreen";
import CreateListingScreen from "./src/screens/CreateListingScreen";
import PreviewListingScreen from "./src/screens/PreviewListingScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import HelpioPayScreen from "./src/screens/HelpioPayScreen";
import ProfessionalDashboardA from "./src/screens/ProfessionalDashboardA";
import AnalyticsDashboardScreen from "./src/screens/AnalyticsDashboardScreen";
import AlertsRemindersScreen from "./src/screens/AlertsRemindersScreen";
import PayoutsBalancesScreen from "./src/screens/PayoutsBalancesScreen";
import HelpiosChoiceScreen from "./src/screens/HelpiosChoiceScreen";
import HelpioVerifiedScreen from "./src/screens/HelpioVerifiedScreen";
import TrendingNowScreen from "./src/screens/TrendingNowScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import MyListingsScreen from "./src/screens/MyListingsScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import SavedScreen from "./src/screens/SavedScreen";
import BuyingHistoryScreen from "./src/screens/BuyingHistoryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import SupportScreen from "./src/screens/SupportScreen";
import LoginScreen from "./src/screens/LoginScreen";
import CreateSubscriptionPlanScreen from "./src/screens/CreateSubscriptionPlanScreen";
import SubscriptionPlanDetailScreen from "./src/screens/SubscriptionPlanDetailScreen";
import ProviderOnboardingScreen from "./src/screens/ProviderOnboardingScreen";
import WebhookEventsScreen from "./src/screens/WebhookEventsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchMarketplaceScreen from "./src/screens/SearchMarketplaceScreen";
import ProviderProfileScreen from "./src/screens/ProviderProfileScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import LocationPickerScreen from "./src/screens/LocationPickerScreen";
import LegalPoliciesScreen from "./src/screens/LegalPoliciesScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import BusinessPlaceProductsScreen from "./src/screens/BusinessPlaceProductsScreen";
import PayoutScreen from "./src/screens/PayoutScreen";
import HelpioReceiptScreen from "./src/screens/HelpioReceiptScreen";


import { api } from "./src/config/api";
import { registerForPushNotificationsAsync } from "./src/utils/pushNotifications";
import { registerNotificationListeners } from "./src/services/notificationService";
import * as Notifications from "expo-notifications";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});





const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------------------------------------------------
   FIX: EmptyPlaceholder MUST be OUTSIDE TabNavigator
--------------------------------------------------- */
function EmptyPlaceholder() {
  return null;
}

function AuthGate() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  const token = useAuthStore((state) => state.token);
  const isGuest = useAuthStore((state) => state.isGuest);

  useEffect(() => {
    hydrate();
  }, []);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // ✅ FIXED LOGIC
  if (!token && !isGuest) {
    return <AuthStack key="auth" />;
  }

  // ✅ Guest OR Logged in → go inside app
  return <RootNavigator key={isGuest ? "guest" : "user"} />;
}



function TabNavigator({ navigation }) {

  const { darkMode } = useTheme();
  const tint = darkMode ? "dark" : "light";
  const lastHomeTapRef = useRef(0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: darkMode ? "#00A6FF" : "#007AFF",
        tabBarInactiveTintColor: darkMode ? "#CCC" : "#1B1B1B",

        tabBarBackground: () => (
          <BlurView
            intensity={70}
            tint={tint}
            style={{ ...StyleSheet.absoluteFillObject, borderRadius: 50 }}
          />
        ),

        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 88,
          borderTopWidth: 0,
          backgroundColor: darkMode
            ? "rgba(20,20,20,0.65)"
            : "rgba(255,255,255,0.35)",
          borderRadius: 0,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -3 },
          elevation: 10,
          paddingBottom: Platform.OS === "ios" ? 18 : 10,
          paddingTop: 6,
        },

        tabBarShowLabel: route.name !== "HelpioPay",

        tabBarIcon: ({ focused, color }) => {
          if (route.name === "HelpioPay") {
            const scaleAnim = useRef(new Animated.Value(1)).current;
            const pulseAnim = useRef(new Animated.Value(1)).current;

            const handlePressIn = () => {
              Animated.spring(scaleAnim, {
                toValue: 0.9,
                useNativeDriver: true,
              }).start();
            };

            const handlePressOut = () => {
              Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
              }).start(() => navigation.navigate("HelpioPay"));
            };

            useEffect(() => {
              const loop = Animated.loop(
                Animated.sequence([
                  Animated.timing(pulseAnim, {
                    toValue: 1.07,
                    duration: 1800,
                    useNativeDriver: true,
                  }),
                  Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1800,
                    useNativeDriver: true,
                  }),
                ])
              );
              loop.start();
              return () => loop.stop();
            }, []);

            return (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: -10,
                  width: 90,
                }}
              >
                <TouchableWithoutFeedback
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                >
                  <Animated.View
                    style={[
                      styles.centerButton,
                      {
                        backgroundColor: darkMode ? "#000" : "#FFF",
                        borderWidth: 2.2,
                        borderColor: "#00A6FF",
                        shadowColor: "#00A6FF",
                        shadowOpacity: 0.22,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 0 },
                        transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
                      },
                    ]}
                  >
                    <BlurView
                      intensity={55}
                      tint={tint}
                      style={StyleSheet.absoluteFill}
                    />
                    <Ionicons
                      name="card-outline"
                      size={22}
                      color={darkMode ? "#00A6FF" : "#007AFF"}
                    />
                  </Animated.View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: focused
                        ? darkMode
                          ? "#00A6FF"
                          : "#007AFF"
                        : darkMode
                        ? "#CCC"
                        : "#1B1B1B",
                      marginTop: 6,
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    Helpio Pay
                  </Text>
                </TouchableWithoutFeedback>
              </View>
            );
          }

          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Messages")
            iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
          else if (route.name === "Invoices")
            iconName = focused ? "document-text" : "document-text-outline";
        else if (route.name === "Dashboard") {
  return (
    <Ionicons
      name={focused ? "stats-chart" : "stats-chart-outline"}
      size={25}
      color={color}
    />
  );
}

          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}
    >
      <Tab.Screen
  name="Home"
  component={AllServicesScreen}
  listeners={({ navigation }) => ({
    tabPress: () => {
      const now = Date.now();
      const delta = now - lastHomeTapRef.current;

      if (delta < 300) {
        // double tap
        DeviceEventEmitter.emit("HELPIO_HOME_TAP", { type: "double", ts: now });
      } else {
        // single tap
        DeviceEventEmitter.emit("HELPIO_HOME_TAP", { type: "single", ts: now });
      }

      lastHomeTapRef.current = now;
    },
  })}
/>
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen
        name="HelpioPay"
        component={EmptyPlaceholder}
        options={{ tabBarLabel: "" }}
      />
      <Tab.Screen name="Invoices" component={InvoicesHomeScreen} />
    <Tab.Screen
  name="Dashboard"
  component={AnalyticsDashboardScreen}

listeners={() => ({
  tabPress: () => {
    // ✅ allow navigation always
  },
})}



/>

    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="ProviderOnboarding"
        component={ProviderOnboardingScreen}
      />
    </Stack.Navigator>
  );
}



function RootNavigator() {
  return (
 <Stack.Navigator
  screenOptions={{
    headerShown: false,
    freezeOnBlur: false,
  }}
>
      
        {/* Main app */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />

        {/* Feed */}
        <Stack.Screen name="HelpiosChoice" component={HelpiosChoiceScreen} />
        <Stack.Screen name="HelpioVerified" component={HelpioVerifiedScreen} />
        <Stack.Screen name="TrendingNow" component={TrendingNowScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Pay modal */}
      <Stack.Screen
  name="HelpioPay"
  component={HelpioPayScreen}
  options={{
    presentation: "transparentModal",
    animation: "fade",
    gestureEnabled: false,
    contentStyle: { backgroundColor: "transparent" },
  }}
/>

        <Stack.Screen
  name="MenuScreen"
  component={MenuScreen}
  options={{
    headerShown: false,
    presentation: "card", // feels native push
  }}
/>



<Stack.Screen
  name="LocationPicker"
  component={LocationPickerScreen}
  options={{ presentation: "fullScreenModal", headerShown: false }}
/>


        {/* Everything else unchanged */}
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
   <Stack.Screen
  name="ServiceDetailScreen"
  component={ServiceDetailScreen}
  options={{
    presentation: "card",
    animation: "fade",
    animationDuration: 120,
    gestureEnabled: false, // navigator cannot dismiss

    contentStyle: { backgroundColor: "transparent" },
  }}
/>
        <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
        <Stack.Screen name="CreateListing" component={CreateListingScreen} />
        <Stack.Screen name="PreviewListing" component={PreviewListingScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ProfessionalDashboardA" component={ProfessionalDashboardA} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="MyListingsScreen" component={MyListingsScreen} />
        <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
        <Stack.Screen name="SavedScreen" component={SavedScreen} />
        <Stack.Screen name="BuyingHistoryScreen" component={BuyingHistoryScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="SupportScreen" component={SupportScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
<Stack.Screen
  name="LegalPoliciesScreen"
  component={LegalPoliciesScreen}
  options={{ headerShown: false }}
/>
        {/* Invoicing */}
        <Stack.Screen name="ClientsScreen" component={ClientsScreen} />
        <Stack.Screen name="SubscriptionPlanDetail" component={SubscriptionPlanDetailScreen} />
        <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
        <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
        <Stack.Screen name="PayoutsBalancesScreen" component={PayoutsBalancesScreen} />
        <Stack.Screen name="AddClient" component={AddClientScreen} />
        <Stack.Screen name="CreateSubscriptionPlan" component={CreateSubscriptionPlanScreen} />
        <Stack.Screen name="AlertsRemindersScreen" component={AlertsRemindersScreen} />
        <Stack.Screen name="InvoiceBuilderScreen" component={InvoiceBuilderScreen} />
        <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
        <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} />
        <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
        <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
        <Stack.Screen name="WebhookEventsScreen" component={WebhookEventsScreen} />

      
<Stack.Screen
  name="SearchMarketplace"
  component={SearchMarketplaceScreen}
  options={{
    headerShown: false,
    presentation: "card",
    animation: "fade",
    animationDuration: 50,
    gestureEnabled: false,

    contentStyle: { backgroundColor: "transparent" },
  }}
/>



<Stack.Screen
  name="ProviderOnboarding"
  component={ProviderOnboardingScreen}
/>



<Stack.Screen
  name="HelpioReceipt"
  component={HelpioReceiptScreen}
  options={{ headerShown: false }}
/>



<Stack.Screen
  name="PayoutScreen"
  component={PayoutScreen}
/>


<Stack.Screen
  name="ProviderProfile"
  component={ProviderProfileScreen}
  options={{ headerShown: false }}
/>


<Stack.Screen
  name="EditProfileScreen"
  component={EditProfileScreen}
  options={{ presentation: "card" }}
/>


<Stack.Screen
  name="BusinessPlaceProducts"
  component={BusinessPlaceProductsScreen}
  options={{ headerShown: false }}
/>

 </Stack.Navigator>
  );
}
export default function App() {
const user = useAuthStore((state) => state.user);

useEffect(() => {
  if (!user) return;

  const setupPush = async () => {
    const authToken = await AsyncStorage.getItem("authToken");
    console.log("🔐 JWT:", authToken);

    const pushToken = await registerForPushNotificationsAsync();

    if (pushToken) {
      try {
        await api.post("/api/users/push-token", {
          token: pushToken,
        });
        console.log("✅ Push token saved");
      } catch (err) {
        console.log("❌ Push token save error:", err);
      }
    }
  };

  setupPush();
}, [user]);


useEffect(() => {
  const setupNotifications = () => {
    if (!navigationRef.isReady()) return;
    return registerNotificationListeners(navigationRef);
  };

  const unsubscribe = setupNotifications();

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>

       <StripeProvider
  publishableKey="pk_test_51SbDkJ9mPNYTMdphO3cieQQSm98oefsmpbVKbZJaYmkRVEkXpboUT77sMGGDnQAlkXavEwF761Mta2CfQaNa1Mgo00tsqEjLah"
  merchantIdentifier="merchant.com.helpio"
  urlScheme="helpio"
>

       <NavigationContainer ref={navigationRef}>
            {/* 🔥 ZUSTAND AUTH GATE */}
            <AuthGate />
          </NavigationContainer>

        </StripeProvider>

      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: "hidden",
  },
});
