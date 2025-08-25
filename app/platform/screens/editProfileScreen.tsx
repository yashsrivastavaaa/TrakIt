import ThemedAlert from "@/components/ThemedAlert"; // ✅ new import
import { user } from "@/config/users";
import { userSchema } from "@/config/userSchema";
import { AuthContext } from "@/context/AuthContext";
import { eq } from "drizzle-orm";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
    const { userData } = useContext(AuthContext);

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        if (userData?.name) {
            setName(userData.name);
        }
    }, [userData]);

    const email = userData?.email || "";

    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showAlert("Validation error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await user
                .update(userSchema)
                .set({
                    name: name.trim(),
                })
                .where(eq(userSchema.email, userData.email));

            showAlert("Success", "Name updated!");
        } catch (e) {
            console.error("Failed to update name:", e);
            showAlert("Error", "Something went wrong while saving.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <Text style={styles.header}>Edit Profile</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor="#555"
                        autoCapitalize="words"
                        returnKeyType="done"
                        editable={!loading}
                    />

                    <Text style={[styles.label, { marginTop: 20 }]}>Email</Text>
                    <Text style={styles.readOnlyInput}>{email}</Text>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.6 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* ✅ Custom Themed Alert */}
            <ThemedAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#10192D",
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 30,
        textAlign: "center",
    },
    form: {
        flex: 1,
    },
    label: {
        color: "#AAAAAA",
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#1E293B",
        color: "#FFFFFF",
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
    },
    readOnlyInput: {
        backgroundColor: "#1E293B",
        color: "#555555",
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
    },
    saveButton: {
        marginTop: 40,
        backgroundColor: "#3D5AFE",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});
