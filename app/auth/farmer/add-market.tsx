import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://mandiconnect.onrender.com";
const PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

type Crop = { _id?: string; id?: string; name: string };
type Market = { _id?: string; id?: string; marketName: string };

const cropTypeOptions = [
  { label: "Veg", value: "vegetable" },
  { label: "Fruit", value: "fruit" },
  { label: "Grain", value: "grain" },
  { label: "Leafy", value: "leafy-vegetable" },
];

// ——— Sticky header sizing (SafeArea-aware) ———
const STATUS_BAR = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;
const HEADER_BODY_HEIGHT = 56; // content height (without status bar)
const HEADER_TOTAL_HEIGHT = HEADER_BODY_HEIGHT + STATUS_BAR;

export default function AddMarket() {
  const router = useRouter();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [selectedCropId, setSelectedCropId] = useState<string>("");
  const [selectedMarketId, setSelectedMarketId] = useState<string>("");

  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("kg");
  const [price, setPrice] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [stateName, setStateName] = useState<string>("Maharashtra");
  const [country] = useState<string>("India");

  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [publicId, setPublicId] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const [userId, setUserId] = useState<string>("");
  const [loadingLists, setLoadingLists] = useState<boolean>(false);

  const [showCropModal, setShowCropModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);

  const [newCropName, setNewCropName] = useState("");
  const [newCropType, setNewCropType] = useState<string>("vegetable");
  const [newCropVariety, setNewCropVariety] = useState("");
  const [savingCrop, setSavingCrop] = useState(false);

  const [newMarketName, setNewMarketName] = useState("");
  const [savingMarket, setSavingMarket] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingLists(true);

        const [token, storedUserId] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("userId"),
        ]);

        setUserId(storedUserId || "");
        await loadLists(token || "");
      } catch {
        Alert.alert("Error", "Failed to load crops or markets.");
      } finally {
        setLoadingLists(false);
      }
    })();
  }, []);

  const loadLists = async (token: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const [cropsRes, marketsRes] = await Promise.all([
      axios.get(`${BASE_URL}/getAllCrop`, { headers }),
      axios.get(`${BASE_URL}/getAllMarket`, { headers }),
    ]);
    setCrops(Array.isArray(cropsRes.data) ? cropsRes.data : []);
    setMarkets(Array.isArray(marketsRes.data) ? marketsRes.data : []);
  };

  const cropId = (c: Crop) => c.id || c._id || "";
  const marketId = (m: Market) => m.id || m._id || "";

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      formData.append("file", {
        uri,
        name: "listing.jpg",
        type: "image/jpeg",
      } as any);

      const res = await axios.post(`${BASE_URL}/marketplace/farmer/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPhotoUrl(res?.data?.url || "");
      setPublicId(res?.data?.public_id || "");
    } catch {
      setPhotoUrl("");
      setPublicId("");
    } finally {
      setUploading(false);
    }
  };

  const addCropQuick = async () => {
    if (!newCropName.trim()) return Alert.alert("Missing", "Enter crop name.");
    try {
      setSavingCrop(true);
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/addCrop`,
        {
          name: newCropName.trim(),
          type: newCropType,
          variety: newCropVariety.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadLists(token || "");
      setShowCropModal(false);
      setNewCropName("");
      setNewCropVariety("");
      setNewCropType("vegetable");
    } catch {
      Alert.alert("Error", "Failed to add crop.");
    } finally {
      setSavingCrop(false);
    }
  };

  const addMarketQuick = async () => {
    if (!newMarketName.trim()) return Alert.alert("Missing", "Enter market name.");
    try {
      setSavingMarket(true);
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/addMarket`,
        {
          marketName: newMarketName.trim(),
          marketAddress: {
            city: newMarketName.trim(),
            state: "Maharashtra",
            country: "India",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadLists(token || "");
      setShowMarketModal(false);
      setNewMarketName("");
    } catch {
      Alert.alert("Error", "Failed to add market.");
    } finally {
      setSavingMarket(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCropId) return Alert.alert("Missing", "Please select a crop.");
    if (!quantity || isNaN(Number(quantity))) return Alert.alert("Missing", "Enter valid quantity.");
    if (!unit.trim()) return Alert.alert("Missing", "Enter unit (e.g. kg).");
    if (!price || isNaN(Number(price))) return Alert.alert("Missing", "Enter valid price.");

    const token = await AsyncStorage.getItem("token");
    if (!token || !userId) {
      Alert.alert("Auth", "Login again.");
      return;
    }

    const payload: any = {
      farmer: { id: userId },
      crop: { id: selectedCropId },
      quantity: Number(quantity),
      unit: unit.trim().toLowerCase(),
      price: Number(price),
      location: {
        city: city.trim(),
        state: stateName.trim(),
        country,
      },
      photoUrl: photoUrl || "",
      publicId: publicId || "",
      status: "active",
    };

    if (selectedMarketId) {
      payload.market = { id: selectedMarketId }; // ✅ add market if selected
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${BASE_URL}/marketplace/farmer/cropListing`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", "Crop listing added successfully");
      resetForm();
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to add crop to marketplace");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCropId("");
    setSelectedMarketId("");
    setQuantity("");
    setUnit("kg");
    setPrice("");
    setCity("");
    setStateName("Maharashtra");
    setPhotoUrl("");
    setPublicId("");
  };

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Sticky Header (absolute + SafeArea) */}
      <SafeAreaView style={styles.stickyHeaderSafe}>
        <View style={styles.stickyHeaderInner}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons name="store-plus" size={28} color="#2E7D32" />
            <Text style={styles.headerTitle}>Add to Marketplace</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Main scroll — add top padding so content starts below sticky header */}
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: HEADER_TOTAL_HEIGHT + 8 }]}>
        {/* Select Crop */}
        <Text style={styles.sectionTitle}>Crop Name:</Text>

        {loadingLists ? (
          <ActivityIndicator color="#2E7D32" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {crops.map((c) => {
              const id = cropId(c);
              const selected = selectedCropId === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => setSelectedCropId(id)}
                  style={[styles.pill, selected && styles.pillActive]}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Full-width grey bar Add Crop */}
        <TouchableOpacity onPress={() => setShowCropModal(true)} style={styles.addBar}>
          <Text style={styles.addBarText}>+ Add Crop</Text>
        </TouchableOpacity>

        {/* Select Market */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Market Name:</Text>

        {loadingLists ? (
          <ActivityIndicator color="#2E7D32" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {markets.map((m) => {
              const id = marketId(m);
              const selected = selectedMarketId === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => setSelectedMarketId(id)}
                  style={[styles.pill, selected && styles.pillActive]}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextActive]}>{m.marketName}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Full-width grey bar Add Market */}
        <TouchableOpacity onPress={() => setShowMarketModal(true)} style={styles.addBar}>
          <Text style={styles.addBarText}>+ Add Market</Text>
        </TouchableOpacity>

        {/* Quantity + Unit */}
        <View style={styles.row}>
          <View style={[styles.inputBox, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 100"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
          <View style={[styles.inputBox, { flex: 1 }]}>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              placeholder="kg / quintal"
              value={unit}
              onChangeText={setUnit}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Price */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2200"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.row}>
          <View style={[styles.inputBox, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sangamner"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={[styles.inputBox, { flex: 1 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="State"
              value={stateName}
              onChangeText={setStateName}
            />
          </View>
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.label}>Country (fixed)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#F3F4F6", color: "#6B7280" }]}
            value={country}
            editable={false}
          />
        </View>

        {/* Upload Image */}
        <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
          <MaterialCommunityIcons name="image-plus" size={18} color="#fff" />
          <Text style={styles.uploadText}>{photoUrl ? "Change Image" : "Upload Image (Optional)"}</Text>
        </TouchableOpacity>

        {uploading && (
          <View style={{ marginVertical: 8 }}>
            <ActivityIndicator size="small" color="#2E7D32" />
          </View>
        )}

        {!!photoUrl && (
          <Image
            source={{ uri: photoUrl || PLACEHOLDER }}
            onError={() => setPhotoUrl(PLACEHOLDER)}
            style={styles.imagePreview}
          />
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Add Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Add Crop Modal */}
      <Modal visible={showCropModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Crop</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Crop name (e.g. Onion)"
              value={newCropName}
              onChangeText={setNewCropName}
            />

            <Text style={[styles.label, { marginTop: 8 }]}>Type</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {cropTypeOptions.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  active={newCropType === opt.value}
                  onPress={() => setNewCropType(opt.value)}
                />
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 8 }]}>Variety (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Red Carrot"
              value={newCropVariety}
              onChangeText={setNewCropVariety}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setShowCropModal(false);
                  setNewCropName("");
                  setNewCropVariety("");
                  setNewCropType("vegetable");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSave} onPress={addCropQuick} disabled={savingCrop}>
                {savingCrop ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Market Modal */}
      <Modal visible={showMarketModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Market</Text>
            <TextInput
              style={styles.input}
              placeholder="Market name (e.g. Pune)"
              value={newMarketName}
              onChangeText={setNewMarketName}
            />

            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
              State defaults to <Text style={{ fontWeight: "700" }}>Maharashtra</Text>, Country to{" "}
              <Text style={{ fontWeight: "700" }}>India</Text>.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setShowMarketModal(false);
                  setNewMarketName("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSave} onPress={addMarketQuick} disabled={savingMarket}>
                {savingMarket ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F9FAFB", paddingBottom: 40 },

  // ✅ Sticky header container (absolute, SafeArea-aware)
  stickyHeaderSafe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    // shadow for iOS
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    // elevation for Android
    elevation: 3,
  },
  stickyHeaderInner: {
    height: HEADER_BODY_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  backButton: {
    padding: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: { fontSize: 20, fontWeight: "700", color: "#2E7D32" },

  sectionTitle: { fontWeight: "700", color: "#111827", marginBottom: 6 },

  // ✅ Horizontal chips (scrollable row)
  pillsRow: {
    paddingVertical: 2,
    paddingRight: 8,
  },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    marginRight: 8,
  },

  pillActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#2E7D32",
  },

  pillText: { color: "#374151", fontWeight: "600" },
  pillTextActive: { color: "#2E7D32", fontWeight: "700" },

  // ✅ Full-width grey bar add buttons
  addBar: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  addBarText: {
    fontWeight: "700",
    color: "#2E7D32",
  },

  row: { flexDirection: "row" },

  inputBox: { marginBottom: 10 },
  label: { marginBottom: 6, fontWeight: "600", color: "#374151" },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },

  uploadBtn: {
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  uploadText: { color: "#fff", fontWeight: "700" },

  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#EEE",
    marginBottom: 10,
  },

  submitBtn: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 24,
  },

  submitText: { color: "#fff", fontWeight: "700" },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },

  chipActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#2E7D32",
  },

  chipText: { color: "#374151", fontWeight: "600" },
  chipTextActive: { color: "#2E7D32", fontWeight: "700" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },

  modalCancel: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  modalCancelText: { color: "#111827", fontWeight: "600" },

  modalSave: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  modalSaveText: { color: "#fff", fontWeight: "700" },
});
