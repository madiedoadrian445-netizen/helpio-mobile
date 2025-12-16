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
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";
import { BlurView } from "expo-blur";
import { ThemeProvider, useTheme } from "./src/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useAuthStore from "./src/store/auth";


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



const Tab = createBottomTabNavigator();
const Stack = createSharedElementStackNavigator();

/* ---------------------------------------------------
   FIX: EmptyPlaceholder MUST be OUTSIDE TabNavigator
--------------------------------------------------- */
function EmptyPlaceholder() {
  return null;
}

function AuthGate() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  if (!isHydrated) {
    return null; // or splash loader
  }

  // Not logged in
  if (!token || !user) {
    return <LoginScreen />;
  }

  return <RootNavigator />;
}

function TabNavigator({ navigation }) {
  const { darkMode } = useTheme();
  const tint = darkMode ? "dark" : "light";

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
          else if (route.name === "Menu")
            return (
              <Image
                source={{ uri: "https://i.imgur.com/NvL4a7X.png" }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 20,
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused
                    ? darkMode
                      ? "#00A6FF"
                      : "#007AFF"
                    : "transparent",
                }}
              />
            );

          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={AllServicesScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen
        name="HelpioPay"
        component={EmptyPlaceholder}
        options={{ tabBarLabel: "" }}
      />
      <Tab.Screen name="Invoices" component={InvoicesHomeScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
        {/* Main app */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />

        {/* Feed */}
        <Stack.Screen name="HelpiosChoice" component={HelpiosChoiceScreen} />
        <Stack.Screen name="HelpioVerified" component={HelpioVerifiedScreen} />
        <Stack.Screen name="TrendingNow" component={TrendingNowScreen} />

        {/* Pay modal */}
        <Stack.Screen
          name="HelpioPay"
          component={HelpioPayScreen}
          options={{
            presentation: "transparentModal",
            animation: "slide_from_bottom",
          }}
        />

        {/* Onboarding */}
        <Stack.Screen
          name="ProviderOnboardingScreen"
          component={ProviderOnboardingScreen}
        />

        {/* Everything else unchanged */}
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="ServiceDetailScreen" component={ServiceDetailScreen} />
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

      
 </Stack.Navigator>
  );
}
export default function App() {
  useEffect(() => {
  AsyncStorage.getItem("authToken").then(token => {
    console.log("🔐 JWT:", token);
  });
}, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          {/* 🔥 ZUSTAND AUTH GATE */}
          <AuthGate />
        </NavigationContainer>
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
