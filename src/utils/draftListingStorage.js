import AsyncStorage from "@react-native-async-storage/async-storage";

const getKey = (providerId) =>
  `HELP_IO_CREATE_LISTING_DRAFT_${providerId}`;

/* Save draft */
export const saveDraftListing = async (providerId, draft) => {
  if (!providerId) return;

  try {
    const payload = {
      ...draft,
      _savedAt: Date.now(),
    };

    await AsyncStorage.setItem(
      getKey(providerId),
      JSON.stringify(payload)
    );
  } catch (e) {
    console.log("Draft save error:", e);
  }
};

/* Load draft */
export const loadDraftListing = async (providerId) => {
  if (!providerId) return null;

  try {
    const data = await AsyncStorage.getItem(getKey(providerId));
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.log("Draft load error:", e);
    return null;
  }
};

/* Clear draft */
export const clearDraftListing = async (providerId) => {
  if (!providerId) return;

  try {
    await AsyncStorage.removeItem(getKey(providerId));
  } catch (e) {
    console.log("Draft clear error:", e);
  }
};