import React, {useState} from "react";
import {StyleSheet, Text, TextInput} from "react-native";
import {useRouter} from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ThemedView} from "@/components/ThemedView";
import {Dialog, PaperProvider, Portal} from "react-native-paper";
import API_URL from "../../config/config";
import { Button } from '@rneui/themed';

export default function LoginScreen() {
    const [email, setemail] = useState("");
    const [password, setPassword] = useState("");
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            const { token } = response.data.data;
            await AsyncStorage.setItem("token", token);
            setDialogMessage("Login successful!");
            setIsSuccess(true);
            setDialogVisible(true);
        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || "An error occurred";
            setDialogMessage(errorMessage);
            setIsSuccess(false);
            setDialogVisible(true);
        }
    };

    const handleDialogDismiss = () => {
        setDialogVisible(false);
        if (isSuccess) {
            router.replace("/(tabs)");
        }
    };

    return (
        <PaperProvider>
            <ThemedView style={styles.container}>
                <Text style={styles.title}>Login Your Account</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setemail}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <Button
                    title="Login"
                    buttonStyle={styles.buttonStyleLogin}
                    titleStyle={styles.loginButtonText}
                    onPress={handleLogin}
                />
                <Button
                    title="Belum Punya Akun? Daftar sekarang"
                    buttonStyle={styles.buttonStyleSingUp}
                    titleStyle={styles.registerButtonText}
                    onPress={() => router.push("/auth/singUp")}/>
                <Portal>
                    <Dialog visible={dialogVisible} onDismiss={handleDialogDismiss}>
                        <Dialog.Title>{isSuccess ? "Success" : "Login Failed"}</Dialog.Title>
                        <Dialog.Content>
                            <Text>{dialogMessage}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={handleDialogDismiss}>OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </ThemedView>
        </PaperProvider>        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: '#ffff',
    },
    title: {
        width: 300,
        fontSize: 38,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
        bottom: 100
    },
    input: {
        width: 344,
        height: 65,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    loginButtonText: {
        color: "#A5FF00",
        fontSize: 16,
        fontWeight: "regular",
    },
    registerButtonText: {
        color: "black",
        fontSize: 15,
        fontWeight: "regular",
    },
    buttonStyleLogin:{
        width: 344,
        height:65,
        backgroundColor: '#2b2f38',
        borderColor: '#2b2f38',
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10
    },
    buttonStyleSingUp:{
        width: 344,
        height:65,
        backgroundColor: '#A5FF00',
        borderColor: '#A5FF00',
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
});
