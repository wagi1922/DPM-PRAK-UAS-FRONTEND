import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "@expo/vector-icons/Feather";
import API_URL from "../../config/config";

interface Item {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Fetch all items from backend
  const fetchItems = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");
      const response = await fetch(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        Alert.alert("Error", "Failed to fetch items");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching items");
    }
  };

  // Add new item
  const addItem = async () => {
    if (!itemName.trim()) {
      Alert.alert("Error", "Nama item tidak boleh kosong!");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/items/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: itemName,
          description: itemDescription,
        }),
      });
      if (response.ok) {
        await fetchItems(); // Refresh list
        closeModal();
      } else {
        Alert.alert("Error", "Failed to add item");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while adding the item");
    }
  };

  // Edit item
  const editItem = async () => {
    if (!selectedItemId) return;
    if (!itemName.trim()) {
      Alert.alert("Error", "Nama item tidak boleh kosong!");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/items/${selectedItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: itemName,
          description: itemDescription,
        }),
      });
      if (response.ok) {
        await fetchItems(); // Refresh list
        closeModal();
      } else {
        Alert.alert("Error", "Failed to edit item");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while editing the item");
    }
  };

  // Delete item
  const deleteItem = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      if (response.ok) {
        await fetchItems(); // Refresh list
      } else {
        Alert.alert("Error", "Failed to delete item");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while deleting the item");
    }
  };

  // Open edit modal
  const openEditModal = (id: string) => {
    const item = items.find((i) => i._id === id);
    if (item) {
      setItemName(item.name);
      setItemDescription(item.description);
      setSelectedItemId(id);
      setModalVisible(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setItemName("");
    setItemDescription("");
    setSelectedItemId(null);
    setModalVisible(false);
  };

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.item}>
      <View style={styles.itemTop}>
        <View>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemDes}>{item.description}</Text>
        </View>
        <Pressable onPress={() => openEditModal(item._id)}>
          <Feather name="edit" size={24} color="#A5FF00" />
        </Pressable>
      </View>
      <View style={styles.itemBottom}>
        <Pressable style={styles.itemButtons} onPress={() => deleteItem(item._id)}>
          <FontAwesome5 name="trash" size={24} color="black" />
        </Pressable>
        <View style={styles.dateLayout}>
          <Text style={styles.itemDate}>{`Dibuat: ${new Date(
            item.createdAt
          ).toLocaleString("id-ID")}`}</Text>
          {item.updatedAt && (
            <Text style={styles.itemDate}>{`Diedit: ${new Date(
              item.updatedAt
            ).toLocaleString("id-ID")}`}</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LIST ITEM</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada item.</Text>}
        contentContainerStyle={styles.flatListContent}
      />
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedItemId ? "Edit Item" : "Tambah Item"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nama Item"
              placeholderTextColor="gray"
              value={itemName}
              onChangeText={setItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="Deskripsi Item"
              placeholderTextColor="gray"
              value={itemDescription}
              onChangeText={setItemDescription}
            />
            <View style={styles.modalButtonslayout}>
              <Pressable style={styles.modalButtons} onPress={closeModal}>
                <Text style={styles.modalButtonsText}>Batal</Text>
              </Pressable>
              <Pressable
                style={styles.modalButtons}
                onPress={selectedItemId ? editItem : addItem}
              >
                <Text style={styles.modalButtonsText}>
                  {selectedItemId ? "Edit" : "Tambah"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: "#ffff",
    color: "#ffff",
    marginTop: 5,
  },
  item: {
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    backgroundColor: "#2b2f38",
    marginBottom: 10,
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
  modalContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#20232a",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#ffff",
  },
  modalButtonslayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButtons: {
    backgroundColor: "#A5FF00",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  modalButtonsText: {
    fontSize: 15,
    fontWeight: "500",
    padding: 7,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
  button: {
    width: 55,
    height: 55,
    bottom: 20,
    right: 10,
    backgroundColor: "#20232a",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderColor: "#A5FF00",
    borderWidth: 2,
  },
  buttonText: {
    color: "#A5FF00",
    fontSize: 30,
  },
  itemButtons: {
    width: 34,
    height: 34,
    backgroundColor: "#A5FF00",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#A5FF00",
    marginBottom: 5,
    width: 300,
  },
  itemDes: {
    fontSize: 17,
    fontWeight: '300',
    color: "#ffff",
    width: 310,
  },
  itemDate: {
    fontSize: 12,
    fontWeight: '200',
    fontStyle: 'italic',
    color: "grey",
    margin: 1.5,
  },
  dateLayout: {
    marginTop: 20,
  },
  flatListContent: {
    paddingBottom: 80,
  },
});

