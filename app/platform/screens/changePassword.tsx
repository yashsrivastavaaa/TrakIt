import ThemedAlert from "@/components/ThemedAlert"; // <-- ✅ Import
import { user } from "@/config/users";
import { userSchema } from "@/config/userSchema";
import { AuthContext } from "@/context/AuthContext";
import { eq } from "drizzle-orm";
import React, { useContext, useState } from "react";
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

export default function ChangePasswordScreen() {
    const { userData } = useContext(AuthContext);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert("Validation Error", "All fields are required.");
            return;
        }

        if (currentPassword !== userData.password) {
            showAlert("Validation Error", "Current password does not match.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert("Validation Error", "New passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            showAlert("Validation Error", "Old and new password cannot be the same.");
            return;
        }

        setLoading(true);
        try {
            await user
                .update(userSchema)
                .set({ password: newPassword })
                .where(eq(userSchema.email, userData.email));

            showAlert("Success", "Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e) {
            console.error("Failed to update password:", e);
            showAlert("Error", "Failed to change password. Try again.");
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
                <Text style={styles.header}>Change Password</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Current Password</Text>
                    <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Enter current password"
                        placeholderTextColor="#555"
                        secureTextEntry
                        editable={!loading}
                    />

                    <Text style={[styles.label, { marginTop: 20 }]}>New Password</Text>
                    <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor="#555"
                        secureTextEntry
                        editable={!loading}
                    />

                    <Text style={[styles.label, { marginTop: 20 }]}>Confirm New Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor="#555"
                        secureTextEntry
                        editable={!loading}
                    />

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.6 }]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Change Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* ✅ Themed Alert */}
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
