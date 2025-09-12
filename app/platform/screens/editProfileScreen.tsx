import ThemedAlert from "@/components/ThemedAlert"; // ✅ new import
import { user } from "@/config/users";
import { userSchema } from "@/config/userSchema";
import { AuthContext } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    const { userData, setUserData } = useContext(AuthContext);


    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const parseTechstacks = (input?: string | string[]): string => {
        if (!input) return '';

        console.log(input);
        try {
            if (typeof input === 'string') {
                const parsed = JSON.parse(input);
                if (Array.isArray(parsed)) {
                    return parsed.join(', ');
                } else if (typeof parsed === 'string') {

                    return parsed;
                }
                return '';
            } else if (Array.isArray(input)) {
                return input.join(', ');
            }
            return '';
        } catch {

            if (typeof input === 'string') {
                return input;
            }
            return '';
        }
    };

    const [name, setName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [location, setLocation] = useState("");
    const [exp, setExp] = useState("");
    const [skills, setSkills] = useState(parseTechstacks(userData?.techstacks) || "");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (userData?.name) {
            setName(userData.name);
        }
        if (userData?.jobTitle) {
            setJobTitle(userData.jobTitle);
        }
        if (userData?.location) {
            setLocation(userData.location);
        }
        if (userData?.experience) {
            setExp(userData.experience ? String(userData.experience) : '');
        }
        if (userData?.skills || userData?.techstacks) {
            setSkills(parseTechstacks(userData.skills));
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
                    jobTitle: jobTitle.trim(),
                    location: location.trim(),
                    experience: exp.trim() ? Number(exp.trim()) : undefined,
                    skills: skills.trim(),
                })
                .where(eq(userSchema.email, userData.email));

            const updatedUser = {
                ...userData,
                name: name.trim(),
                jobTitle: jobTitle.trim(),
                location: location.trim(),
                experience: exp.trim() ? Number(exp.trim()) : undefined,
                skills: skills.trim(),
            };

            const result = [updatedUser];

            setUserData(result[0]);
            await AsyncStorage.setItem('userData', JSON.stringify(result[0]));

            const userObj = result[0];
            setUserData(userObj);
            await AsyncStorage.setItem('userData', JSON.stringify(userObj));

            showAlert("Success", "Profile updated!");
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

                    <Text style={[styles.label, { marginTop: 20 }]}>Job Title</Text>

                    <TextInput
                        style={styles.input}
                        value={jobTitle}
                        onChangeText={setJobTitle}
                        placeholder="Job Title"
                        placeholderTextColor="#555"
                        autoCapitalize="words"
                        returnKeyType="done"
                        editable={!loading}
                    />
                    <Text style={[styles.label, { marginTop: 20 }]}>Location</Text>
                    <TextInput
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Location"
                        placeholderTextColor="#555"
                        autoCapitalize="words"
                        returnKeyType="done"
                        editable={!loading}
                    />
                    <Text style={[styles.label, { marginTop: 20 }]}>Experience</Text>

                    <TextInput
                        style={styles.input}
                        value={exp}
                        onChangeText={setExp}
                        placeholder="Enter Experience(in years) round off to nearest integer"
                        placeholderTextColor="#555"
                        autoCapitalize="words"
                        returnKeyType="done"
                        editable={!loading}
                    />
                    <Text style={[styles.label, { marginTop: 20 }]}>Skills</Text>
                    <TextInput
                        style={styles.input}
                        value={skills}
                        onChangeText={setSkills}
                        placeholder="Enter your skills (comma separated)"
                        placeholderTextColor="#555"
                        autoCapitalize="words"
                        returnKeyType="done"
                        editable={!loading}
                    />

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
