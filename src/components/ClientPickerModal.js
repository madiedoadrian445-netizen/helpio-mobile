import React from "react";
import { View, StyleSheet } from "react-native";
import ClientsScreen from "../screens/ClientsScreen";

export default function ClientPickerModal({ navigation, route }) {
  return (
    <View style={styles.container}>
         <View style={styles.handle} /> 
   
   
   
   <ClientsScreen
  navigation={navigation}
  route={{
    ...route,
    params: {
      ...route?.params,
      isPicker: true,
    },
  }}
/>


    </View>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  paddingTop: 30, // 🔥 increase this
},

handle: {
  alignSelf: "center",
  width: 40,
  height: 5,
  borderRadius: 999,
  backgroundColor: "#C7C7CC",
  marginBottom: 6,
},

});