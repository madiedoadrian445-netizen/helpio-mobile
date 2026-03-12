// src/components/CoverEditorModal.js

import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as ImageManipulator from "expo-image-manipulator";

const { width } = Dimensions.get("window");

const FEED_RATIO = 1.24;

export default function CoverEditorModal({
  visible,
  imageUri,
  onClose,
  onSave,
}) {
  const [areaHeight, setAreaHeight] = useState(0);
  const [imgRatio, setImgRatio] = useState(1);
const [topBarHeight, setTopBarHeight] = useState(0);
  const cropHeight = width * FEED_RATIO;

  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  // AUTO FIT WHEN OPENING
  useEffect(() => {
    if (visible && imgRatio) {
      const displayedHeight = width / imgRatio;
      const minScale = cropHeight / displayedHeight;

      scale.value = Math.max(1, minScale);
      startScale.value = scale.value;

      translateX.value = 0;
      translateY.value = 0;
    }
  }, [visible, imgRatio]);

  // PINCH
  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = startScale.value * e.scale;
      scale.value = Math.max(1, next);
    });

  // PAN
  const pan = Gesture.Pan()
    .onStart(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    })
    .onUpdate((e) => {
      const displayedHeight = width / imgRatio;
      const scaledHeight = displayedHeight * scale.value;

      const maxX = Math.max(0, (width * scale.value - width) / 2);
      const maxY = Math.max(0, (scaledHeight - cropHeight) / 2);

      const nextX = offsetX.value + e.translationX;
      const nextY = offsetY.value + e.translationY;

      translateX.value = Math.max(-maxX, Math.min(maxX, nextX));
      translateY.value = Math.max(-maxY, Math.min(maxY, nextY));
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => {
    const displayedHeight = width / imgRatio;
    const scaledHeight = displayedHeight * scale.value;

    const maxX = Math.max(0, (width * scale.value - width) / 2);
    const maxY = Math.max(0, (scaledHeight - cropHeight) / 2);

    const clampedX = Math.max(-maxX, Math.min(maxX, translateX.value));
    const clampedY = Math.max(-maxY, Math.min(maxY, translateY.value));

    return {
      transform: [
        { translateX: clampedX },
        { translateY: clampedY },
        { scale: scale.value },
      ],
    };
  });

  const handleSave = async () => {
  try {
    const { width: imgW, height: imgH } =
      await new Promise((resolve, reject) => {
        Image.getSize(
          imageUri,
          (w, h) => resolve({ width: w, height: h }),
          reject
        );
      });

    const displayedHeight = width / imgRatio;

    const scaleX = imgW / width;
    const scaleY = imgH / displayedHeight;

    // Final clamped values (same as UI)
    const scaledHeight = displayedHeight * scale.value;

    const maxX = Math.max(0, (width * scale.value - width) / 2);
    const maxY = Math.max(0, (scaledHeight - cropHeight) / 2);

    const clampedX = Math.max(-maxX, Math.min(maxX, translateX.value));
    const clampedY = Math.max(-maxY, Math.min(maxY, translateY.value));

    // Crop size in original image coordinates
    const cropWidth = (width / scale.value) * scaleX;
    const cropHeightScaled = (cropHeight / scale.value) * scaleY;

    // Center of image in original coordinates
    const centerX = imgW / 2;
    const centerY = imgH / 2;

    const originX =
      centerX - cropWidth / 2 - clampedX * scaleX;

    const originY =
      centerY - cropHeightScaled / 2 - clampedY * scaleY;

    const cropped = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: Math.max(0, originX),
            originY: Math.max(0, originY),
            width: cropWidth,
            height: cropHeightScaled,
          },
        },
      ],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    onSave(cropped.uri);
    onClose();
  } catch (e) {
    console.log("Crop failed:", e);
  }
};

  const maskHeight = (areaHeight - cropHeight) / 2;

  return (
    <Modal visible={visible} animationType="fade">
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>


{/* FULL SCREEN TOP MASK */}
<View
  pointerEvents="none"
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: topBarHeight + maskHeight,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 2,
  }}
/>



        {/* TOP BAR */}
       <View
  style={styles.topBar}
  onLayout={(e) =>
    setTopBarHeight(e.nativeEvent.layout.height)
  }
>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Adjust Cover</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.save}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* IMAGE AREA */}
        <View
          style={styles.imageArea}
          onLayout={(e) =>
            setAreaHeight(e.nativeEvent.layout.height)
          }
        >
          <GestureDetector gesture={composed}>
            <Animated.View style={[styles.imageWrap, animatedStyle]}>
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: width,
                  height: width / imgRatio,
                }}
                resizeMode="cover"
                onLoad={(e) => {
                  const { width: w, height: h } =
                    e.nativeEvent.source;
                  setImgRatio(w / h);
                }}
              />
            </Animated.View>
          </GestureDetector>

      

          {/* BOTTOM MASK */}
          <View
            pointerEvents="none"
            style={[styles.mask, { height: maskHeight, bottom: 0 }]}
          />

          {/* CROP FRAME */}
          <View
            pointerEvents="none"
       style={[
  styles.cropFrame,
  {
    height: cropHeight,
    top: maskHeight,
  },
]}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  topBar: {
  paddingTop: 60,
  paddingHorizontal: 20,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  zIndex: 10,
},

  cancel: {
    color: "#ccc",
    fontSize: 16,
  },

  save: {
    color: "#00A6FF",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  imageArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

 imageWrap: {
  position: "absolute",
  width: width,
  alignItems: "center",
  zIndex: 1,
},

 mask: {
  position: "absolute",
  left: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  zIndex: 2,
},
cropFrame: {
  position: "absolute",
  width: width,
  borderWidth: 2,
  borderColor: "white",
  zIndex: 5,
},
});
