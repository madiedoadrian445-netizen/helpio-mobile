import React, { useState } from "react";
import {
  Animated,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function LeaveReviewModal({
visible,
  onClose,
  onSubmit,
  serviceId,
  providerId,
  conversationId
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
const fadeAnim = useState(new Animated.Value(0))[0];
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };


React.useEffect(() => {
  if (visible) {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true
    }).start();
  } else {
    fadeAnim.setValue(0);
  }
}, [visible]);


  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (rating === 3) {
      if (!comment.trim() || comment.trim().length < 14) {
        alert("Please provide at least 14 characters explaining your rating.");
        return;
      }
    }

    if (rating <= 2) {
      if (!comment.trim() || comment.trim().length < 14) {
        alert("Low ratings require at least 14 characters explaining the issue.");
        return;
      }

      if (!image) {
        alert("Low ratings require a photo to support your claim.");
        return;
      }
    }

   onSubmit({
  serviceId,
  providerId,
  conversationId,
  rating,
  comment,
  imageUrl: image || null
});

    // Reset state after submit
    setRating(0);
    setComment("");
    setImage(null);
    onClose();
  };


const handleClose = () => {
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 160,
    useNativeDriver: true
  }).start(() => {
    onClose();
  });
};


  const renderStars = () =>
    [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => setRating(star)}>
        <Text style={[styles.star, rating >= star && styles.activeStar]}>
          ★
        </Text>
      </TouchableOpacity>
    ));





    
 return (
  <Modal visible={visible} animationType="none" transparent>

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
      style={{ flex: 1 }}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
     <Animated.View
  style={[
    styles.overlay,
    { opacity: fadeAnim }
  ]}
>

         <ScrollView
  scrollEnabled={false}
  keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end"
            }}
          >

          <View style={styles.container}>

  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
    <Text style={styles.closeText}>×</Text>
  </TouchableOpacity>

  <Text style={styles.title}>Leave a Review</Text>

              <View style={styles.starRow}>{renderStars()}</View>

             <TextInput
                  placeholder="Write your review..."
                  style={styles.input}
                  multiline
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit
                />
              

             
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImage}
                >
                  <Text style={styles.imageButtonText}>
                    Upload Photo
                  </Text>
                </TouchableOpacity>
              

              {image && (
                <Image
                  source={{ uri: image }}
                  style={styles.preview}
                />
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Submit Review</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

            </View>

         </ScrollView>

      </Animated.View>

        
      </TouchableWithoutFeedback>

    </KeyboardAvoidingView>
     
  </Modal>
  
);
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  starRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  star: {
    fontSize: 30,
    marginRight: 10,
    color: "#ccc",
  },


  closeButton: {
  position: "absolute",
  right: 15,
  top: 12,
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: "#f2f2f2",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10
},

closeText: {
  fontSize: 20,
  color: "#444",
  marginTop: -1
},


  activeStar: {
    color: "#00A6FF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    padding: 12,
    minHeight: 90,
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 15,
  },
  imageButtonText: {
    fontWeight: "500",
  },
  preview: {
    width: "100%",
    height: 150,
    borderRadius: 14,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#00A6FF",
    padding: 15,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelText: {
    textAlign: "center",
    color: "#888",
  },
});
