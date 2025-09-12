import { contact } from '@/config/contact';
import { contactSchema } from '@/config/contactSchema';
import { AuthContext } from '@/context/AuthContext';
import Feather from '@expo/vector-icons/Feather';
import { eq } from 'drizzle-orm'; // Import 'eq' for the where clause
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// --- ThemedAlert Component Definition ---
const ThemedAlert = ({
    visible,
    title,
    message,
    onClose,
    iconName = "alert-triangle",
    iconColor = "#facc15"
}: {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    iconName?: React.ComponentProps<typeof Feather>['name'];
    iconColor?: string;
}) => {
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.alertOverlay}>
                <View style={styles.alertBox}>
                    <Feather name={iconName} size={32} color={iconColor} style={{ marginBottom: 12 }} />
                    <Text style={styles.alertTitle}>{title}</Text>
                    <Text style={styles.alertMessage}>{message}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.alertButton}>
                        <Text style={styles.alertButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function AddContactScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [company, setCompany] = useState('');

    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const { userData } = useContext(AuthContext);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertConfig, setAlertConfig] = useState<{ iconName: React.ComponentProps<typeof Feather>['name']; iconColor: string }>({ iconName: 'alert-triangle', iconColor: '#facc15' });

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertConfig(type === 'success'
            ? { iconName: 'check-circle', iconColor: '#4ade80' }
            : { iconName: 'alert-triangle', iconColor: '#facc15' }
        );
        setAlertVisible(true);
    };

    const validateEmail = (text: string) => {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (text && !emailRegex.test(text)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
        setEmail(text);
    };

    const validatePhoneNumber = (text: string) => {
        const phoneRegex = /^\d{10}$/;
        if (text && !phoneRegex.test(text)) {
            setPhoneError('Phone number must be 10 digits.');
        } else {
            setPhoneError('');
        }
        setPhoneNumber(text);
    };

    // --- UPDATED: handleSaveContact now checks for duplicate emails ---
    const handleSaveContact = async () => {
        // Step 1: Client-side validation
        if (!name.trim()) {
            showAlert('Validation Error', 'Please enter a name.');
            return;
        }
        if (emailError || !email) {
            showAlert('Validation Error', 'Please enter a valid email.');
            return;
        }
        if (phoneError) {
            showAlert('Validation Error', 'Please correct the phone number.');
            return;
        }

        setIsSaving(true);
        Keyboard.dismiss();

        try {
            const trimmedEmail = email.trim();

            // Step 2: Check if a contact with this email already exists for the user
            const existingContact = await contact
                .select()
                .from(contactSchema)
                .where(eq(contactSchema.email, trimmedEmail))
                .limit(1);

            // Step 3: If a duplicate is found, show an alert and stop
            if (existingContact.length > 0) {
                showAlert('Duplicate Contact', 'A contact with this email already exists.');
                return; // Abort the save operation
            }

            // Step 4: If no duplicate is found, proceed with insertion
            await contact.insert(contactSchema).values({
                name: name.trim(),
                email: trimmedEmail,
                phone_number: phoneNumber.trim() || null,
                company: company.trim() || null,
                user_email: userData.email,
            });

            showAlert('Success', 'Contact has been saved successfully!', 'success');
        } catch (error) {
            console.error("Failed to save contact:", error);
            showAlert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const isFormValid = name.trim() !== '' && email.trim() !== '' && !emailError && !phoneError;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ThemedAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                iconName={alertConfig.iconName}
                iconColor={alertConfig.iconColor}
                onClose={() => {
                    setAlertVisible(false);
                    if (alertTitle === 'Success') {
                        router.back();
                    }
                }}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Feather name="arrow-left" size={24} color="#E2E8F0" />
                </TouchableOpacity>
                <Text style={styles.title}>Create Contact</Text>
                <TouchableOpacity
                    onPress={handleSaveContact}
                    disabled={!isFormValid || isSaving}
                    style={styles.headerButton}
                >
                    <Text style={[styles.saveText, (!isFormValid || isSaving) && styles.saveTextDisabled]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.form}>
                    {/* Input fields remain the same */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <View style={[styles.inputContainer, focusedField === 'name' && styles.inputContainerFocused]}>
                            <Feather name="user" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter full name"
                                placeholderTextColor="#546581"
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, emailError ? styles.inputContainerError : focusedField === 'email' ? styles.inputContainerFocused : null]}>
                            <Feather name="mail" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={validateEmail}
                                placeholder="Enter email address"
                                placeholderTextColor="#546581"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={[styles.inputContainer, phoneError ? styles.inputContainerError : focusedField === 'phone' ? styles.inputContainerFocused : null]}>
                            <Feather name="phone" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={validatePhoneNumber}
                                placeholder="Enter 10-digit number (optional)"
                                placeholderTextColor="#546581"
                                keyboardType="phone-pad"
                                maxLength={10}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Company</Text>
                        <View style={[styles.inputContainer, focusedField === 'company' && styles.inputContainerFocused]}>
                            <Feather name="briefcase" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={company}
                                onChangeText={setCompany}
                                placeholder="Enter company name (optional)"
                                placeholderTextColor="#546581"
                                onFocus={() => setFocusedField('company')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, (!isFormValid || isSaving) && styles.saveButtonDisabled]}
                    onPress={handleSaveContact}
                    disabled={!isFormValid || isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#0F172A" />
                    ) : (
                        <>
                            <Feather name="check-circle" size={22} color="#0F172A" />
                            <Text style={styles.saveButtonText}>Save Contact</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    headerButton: { padding: 8 },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F1F5F9',
    },
    saveText: { fontSize: 16, fontWeight: '600', color: '#38BDF8' },
    saveTextDisabled: { color: '#56698F' },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 40,
    },
    form: { paddingHorizontal: 24 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        height: 55,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputContainerError: { borderColor: '#be123c' },
    inputContainerFocused: {
        borderColor: '#38BDF8',
        backgroundColor: '#0F172A',
    },
    inputIcon: { paddingHorizontal: 16 },
    input: { flex: 1, fontSize: 16, color: '#F1F5F9', height: '100%' },
    errorText: { color: '#fb7185', fontSize: 13, marginTop: 6, marginLeft: 4 },
    saveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#38BDF8',
        marginHorizontal: 24,
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 20,
        minHeight: 55,
    },
    saveButtonDisabled: { backgroundColor: '#334155' },
    saveButtonText: { color: '#0F172A', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    alertOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    alertBox: {
        width: '85%',
        maxWidth: 350,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
    },
    alertTitle: {
        color: '#F1F5F9',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    alertMessage: {
        color: '#cbd5e1',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    alertButton: {
        backgroundColor: '#38BDF8',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    alertButtonText: { color: '#0F172A', fontWeight: 'bold', fontSize: 16 },
});