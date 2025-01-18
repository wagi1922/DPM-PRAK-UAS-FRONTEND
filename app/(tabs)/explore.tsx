import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../../config/config";

interface UserProfile {
  username: string;
  email: string;
}

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");
        const response = await axios.get<{ data: UserProfile }>(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin logout?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              router.replace("/auth/login");
            } catch (error) {
              console.error("Error on logout:", error);
            }
          } 
        },
      ],
      { cancelable: true }
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Profil User</Text>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{user.username}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#A5FF00",
    marginBottom: 30,
    textAlign: "center"
  },
  infoContainer: {
    width: "100%",
    marginBottom: 50,
    backgroundColor: "#2a2d37",
    padding: 20,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    color: "gray",
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#A5FF00",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#20232a",
  },
});
