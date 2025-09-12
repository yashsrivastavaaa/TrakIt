import { contact } from '@/config/contact';
import { contactSchema } from '@/config/contactSchema';
import { AuthContext } from '@/context/AuthContext';
import Feather from '@expo/vector-icons/Feather';
import { and, eq, not } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert, // Using native Alert for the confirmation dialog
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

// --- TYPE DEFINITION ---
type Contact = {
    id: number;
    name: string;
    email: string;
    phone_number?: string | null;
    company?: string | null;
    user_email?: string | null;
};

// --- ThemedAlert Component (from previous screens) ---
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

export default function EditContactScreen() {
    const router = useRouter();
    const { userData } = useContext(AuthContext);

    // --- Receive and Parse Contact Data from Navigation ---
    const { contactData } = useLocalSearchParams<{ contactData: string }>();
    const [originalContact, setOriginalContact] = useState<Contact | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [company, setCompany] = useState('');

    // Validation and UI state
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false); // For both update and delete

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertConfig, setAlertConfig] = useState<{ iconName: React.ComponentProps<typeof Feather>['name']; iconColor: string }>({ iconName: 'alert-triangle', iconColor: '#facc15' });

    // --- Pre-fill Form When Data is Received ---
    useEffect(() => {
        if (contactData) {
            try {
                const parsedContact: Contact = JSON.parse(contactData);
                setOriginalContact(parsedContact);
                setName(parsedContact.name || '');
                setEmail(parsedContact.email || '');
                setPhoneNumber(parsedContact.phone_number || '');
                setCompany(parsedContact.company || '');
            } catch (error) {
                console.error("Failed to parse contact data:", error);
                showAlert('Error', 'Could not load contact data.', 'error');
                router.back();
            }
        }
    }, [contactData]);

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
        setEmailError(text && !emailRegex.test(text) ? 'Please enter a valid email address.' : '');
        setEmail(text);
    };

    const validatePhoneNumber = (text: string) => {
        const phoneRegex = /^\d{10}$/;
        setPhoneError(text && !phoneRegex.test(text) ? 'Phone number must be 10 digits.' : '');
        setPhoneNumber(text);
    };

    // --- UPDATE LOGIC ---
    const handleUpdateContact = async () => {
        if (!originalContact || !userData?.email) return;

        if (!name.trim() || !email.trim() || emailError || phoneError) {
            showAlert('Validation Error', 'Please correct the errors before saving.');
            return;
        }

        setIsProcessing(true);
        Keyboard.dismiss();

        try {
            const trimmedEmail = email.trim();

            // Check if the new email is taken by ANOTHER contact
            if (trimmedEmail !== originalContact.email) {
                const existingContact = await contact.select().from(contactSchema)
                    .where(and(
                        eq(contactSchema.email, trimmedEmail),
                        not(eq(contactSchema.id, originalContact.id))
                    )).limit(1);

                if (existingContact.length > 0) {
                    showAlert('Duplicate Email', 'This email is already used by another contact.');
                    return;
                }
            }

            // Proceed with the update
            await contact.update(contactSchema)
                .set({
                    name: name.trim(),
                    email: trimmedEmail,
                    phone_number: phoneNumber.trim() || null,
                    company: company.trim() || null,
                })
                .where(eq(contactSchema.id, originalContact.id));

            showAlert('Success', 'Contact updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update contact:", error);
            showAlert('Error', 'An unexpected error occurred.');
        } finally {
            setIsProcessing(false);
        }
    };

    // --- DELETE LOGIC ---
    const handleDeleteContact = async () => {
        if (!originalContact) return;

        setIsProcessing(true);
        try {
            await contact.delete(contactSchema).where(eq(contactSchema.id, originalContact.id));
            showAlert('Deleted', 'Contact has been removed.', 'success');
        } catch (error) {
            console.error("Failed to delete contact:", error);
            showAlert('Error', 'Could not delete the contact.');
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            'Delete Contact',
            'Are you sure you want to permanently delete this contact?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: handleDeleteContact },
            ]
        );
    };


    const isFormValid = name.trim() !== '' && email.trim() !== '' && !emailError && !phoneError;

    if (!originalContact) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#38BDF8" />
            </View>
        );
    }

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
                    // Navigate back only after a successful update or delete
                    if (alertTitle === 'Success' || alertTitle === 'Deleted') {
                        router.back();
                    }
                }}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Feather name="arrow-left" size={24} color="#E2E8F0" />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Contact</Text>
                {/* A placeholder view to keep the title centered */}
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.form}>
                    {/* Form inputs are the same as addContact */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <View style={[styles.inputContainer, focusedField === 'name' && styles.inputContainerFocused]}>
                            <Feather name="user" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
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
                                onFocus={() => setFocusedField('company')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </View>
                </View>

                {/* --- Action Buttons --- */}
                <TouchableOpacity
                    style={[styles.actionButton, (!isFormValid || isProcessing) && styles.actionButtonDisabled]}
                    onPress={handleUpdateContact}
                    disabled={!isFormValid || isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#0F172A" />
                    ) : (
                        <>
                            <Feather name="save" size={22} color="#0F172A" />
                            <Text style={styles.actionButtonText}>Update Contact</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={confirmDelete}
                    disabled={isProcessing}
                >
                    <Feather name="trash-2" size={22} color="#F1F5F9" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Contact</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    title: { fontSize: 22, fontWeight: 'bold', color: '#F1F5F9' },
    scrollContent: { paddingTop: 24, paddingBottom: 40 },
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
    actionButton: {
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
    actionButtonDisabled: { backgroundColor: '#334155' },
    actionButtonText: { color: '#0F172A', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    deleteButton: {
        backgroundColor: '#be123c', // Destructive red color
        marginTop: 16,
    },
    deleteButtonText: {
        color: '#F1F5F9', // White text for contrast on red
    },
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