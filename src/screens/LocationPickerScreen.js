// src/screens/LocationPickerScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

export default function LocationPickerScreen({ navigation, route }) {
  const mapRef = useRef(null);

  const [search, setSearch] = useState("");

  const [region, setRegion] = useState({
    latitude: 25.7617,
    longitude: -80.1918,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [pinLocation, setPinLocation] = useState({
    latitude: 25.7617,
    longitude: -80.1918,
  });

  const [address, setAddress] = useState(null);

  /* ⭐ NEW — radius state */
  const [radius, setRadius] = useState(10);
  const [radiusModalVisible, setRadiusModalVisible] = useState(false);

  /* ---------------- REVERSE GEOCODE ---------------- */
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (res.length > 0) {
        const place = res[0];

        setAddress({
          city: place.city,
          state: place.region,
          zip: place.postalCode,
          lat,
          lng,
        });
      }
    } catch (e) {
      console.log("Reverse geocode error:", e);
    }
  };

  /* ---------------- MAP DRAG (camera only) ---------------- */
 const handleRegionChange = (r) => {
  setRegion(r);

  const { latitude, longitude } = r;

  setPinLocation({ latitude, longitude });
  reverseGeocode(latitude, longitude);
};


  /* ---------------- SEARCH SUBMIT ---------------- */
  const handleSearchSubmit = async () => {
    if (!search.trim()) return;

    try {
      const results = await Location.geocodeAsync(search);
      if (!results.length) return;

      const { latitude, longitude } = results[0];

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setRegion(newRegion);
      setPinLocation({ latitude, longitude });
      reverseGeocode(latitude, longitude);

      mapRef.current?.animateToRegion(newRegion, 500);
    } catch (e) {
      console.log("Geocode error:", e);
    }
  };

  /* ---------------- APPLY ---------------- */
  const applyLocation = () => {
    if (!address) return;

    route.params?.onSelect?.({
      ...address,
      radius,
    });

    navigation.goBack();
  };

  /* Initial reverse geocode */
  useEffect(() => {
    reverseGeocode(pinLocation.latitude, pinLocation.longitude);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* MAP */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={handleRegionChange}
      >
        <Marker coordinate={pinLocation} />

        {/* ⭐ Radius circle uses miles */}
        <Circle
          center={pinLocation}
          radius={radius * 1609.34}
          strokeColor="rgba(0,166,255,0.35)"
          fillColor="rgba(0,166,255,0.12)"
        />
      </MapView>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Type your operating area location, city or ZIP"
          style={{ flex: 1, marginLeft: 8 }}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
      </View>

      {/* ⭐ RADIUS CHIP */}
      <TouchableOpacity
        style={styles.radiusChip}
        activeOpacity={0.8}
        onPress={() => setRadiusModalVisible(true)}
      >
        <Ionicons name="location-sharp" size={14} color="#00A6FF" />
        <Text style={styles.radiusText}>
          {address?.city || "Miami"} • {radius} mi
        </Text>
      </TouchableOpacity>

      {/* APPLY BUTTON */}
      <TouchableOpacity style={styles.applyBtn} onPress={applyLocation}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>

      {/* ⭐ RADIUS BOTTOM SHEET */}
      {radiusModalVisible && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRadiusModalVisible(false)}
        >
          <View style={styles.radiusSheet}>
            <Text style={styles.sheetTitle}>Search radius</Text>

            {[10, 15, 20, 25,].map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.radiusOption}
                onPress={() => {
                  setRadius(r);
                  setRadiusModalVisible(false);
                }}
              >
                <Ionicons
                  name={radius === r ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color="#00A6FF"
                />
                <Text style={styles.radiusOptionText}>{r} miles</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  radiusChip: {
    position: "absolute",
    top: 115,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  radiusText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#00A6FF",
  },

  applyBtn: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 20,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },

  applyText: {
    color: "#090909",
    fontSize: 17,
    fontWeight: "600",
  },

  modalOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },

  radiusSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  radiusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  radiusOptionText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});
