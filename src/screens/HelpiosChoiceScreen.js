// src/screens/HelpiosChoiceScreen.js
import React from "react";
import ServicesScreen from "./AllServicesScreen";

export default function HelpiosChoiceScreen(props) {
  return (
    <ServicesScreen
      {...props}
      feedType="choice"
      activeTab="choice"
    />
  );
}
