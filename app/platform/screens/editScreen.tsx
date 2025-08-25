import { jobs } from '@/config/jobs';
import { jobSchema } from '@/config/jobSchema';
import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditScreen() {
    type JobParams = {
        id?: string;
        email?: string;
        company_name?: string;
        status?: string;
        role?: string;
        date_applied?: string;
        notes?: string;
        ctc?: number;
        location?: string;
        techstacks?: string | string[];
    };


    const value = useLocalSearchParams() as JobParams;
    const router = useRouter();

    const parseTechstacks = (input?: string | string[]): string => {
        if (!input) return '';
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

    const [company, setCompany] = useState(value.company_name || '');
    const [role, setRole] = useState(value.role || '');
    const [status, setStatus] = useState(value.status || 'Applied');
    const [dateApplied, setDateApplied] = useState(
        value.date_applied ? new Date(value.date_applied) : new Date()
    );
    const [notes, setNotes] = useState(value.notes || '');
    const [ctc, setCtc] = useState(value.ctc ? String(value.ctc) : '');
    const [location, setLocation] = useState(value.location || '');
    const [techstacks, setTechstacks] = useState(parseTechstacks(value.techstacks));
    const [loading, setLoading] = useState(false);
    const [loadingD, setLoadingD] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const statuses = ['Applied', 'Interviewing', 'Offered', 'Rejected', 'Accepted'];
    const statusColors: { [key: string]: string } = {
        Applied: '#4CAF50',
        Interviewing: '#2196F3',
        Offered: '#FF9800',
        Rejected: '#F44336',
        Accepted: '#9C27B0',
    };

    const onChangeDate = (_: any, selectedDate?: Date) => {
        const currentDate = selectedDate || dateApplied;
        setShowDatePicker(Platform.OS === 'ios');
        setDateApplied(currentDate);
    };

    const ThemedAlert = ({ visible, title, message, onClose }: any) => {
        return (
            <Modal transparent animationType="fade" visible={visible}>
                <View style={styles.overlay}>
                    <View style={styles.alertBox}>
                        {title ? <Text style={styles.alertTitle}>{title}</Text> : null}
                        <Text style={styles.alertMessage}>{message}</Text>
                        <TouchableOpacity style={styles.alertButton} onPress={onClose}>
                            <Text style={styles.alertButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const [alertVisible, setAlertVisible] = useState(false);

    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const saveInDB = async () => {
        if (!company || !role) {
            setAlertTitle('Error');
            setAlertMessage('Company and Role are required.');
            setAlertVisible(true);
            return;
        }

        const jobId = value.id ? Number(value.id) : undefined;
        if (!jobId) {
            setAlertTitle('Error');
            setAlertMessage('Job Id is missing or invalid.');
            setAlertVisible(true);
            return;
        }

        setLoading(true);
        try {
            const result = await jobs
                .update(jobSchema)
                .set({
                    company_name: company,
                    role,
                    status,
                    date_applied: dateApplied.toISOString().split('T')[0],
                    notes: notes || null,
                    ctc: ctc,
                    location: location || null,
                    techstacks: techstacks ? techstacks.split(',').map(t => t.trim()) : null,
                    updated_at: new Date(),
                })
                .where(eq(jobSchema.job_id, jobId));

            console.log('Updated:', result);
            setAlertTitle('Success');
            setAlertMessage('Job details updated Successfully.');
            setAlertVisible(true);
        } catch (error) {
            console.error('DB Update Error:', error);
            setAlertTitle('Error');
            setAlertMessage('Unable to add job.');
            setAlertVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const deleteFromDB = async () => {
        const jobId = value.id ? Number(value.id) : undefined;
        if (!jobId) {
            setAlertTitle('Error');
            setAlertMessage('Job Id is missing or invalid.');
            setAlertVisible(true);
            return;
        }

        setLoadingD(true);
        try {
            await jobs.delete(jobSchema).where(eq(jobSchema.job_id, jobId));
            setAlertTitle('Success');
            setAlertMessage('Job details deleted successfully.');
            setAlertVisible(true);
        } catch (error) {
            console.error('DB Delete Error:', error);
            setAlertTitle('Error');
            setAlertMessage('Unable to delete job.');
            setAlertVisible(true);
        } finally {
            setLoadingD(false);
        }
    };



    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.header}>Edit Job Details</Text>

                        {/* Company Name */}
                        <View style={styles.inputContainer}>
                            <AntDesign name="profile" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="Company Name"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={company}
                                onChangeText={setCompany}
                                returnKeyType="next"
                            />
                        </View>

                        {/* Role */}
                        <View style={styles.inputContainer}>
                            <AntDesign name="idcard" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="Role"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={role}
                                onChangeText={setRole}
                                returnKeyType="next"
                            />
                        </View>

                        {/* Status Picker */}
                        <View style={styles.inputContainer}>
                            <AntDesign name="tags" size={20} color="#666" style={styles.icon} />
                            <TouchableOpacity
                                style={[styles.input, styles.pickerInput]}
                                onPress={() => setShowStatusDropdown((prev) => !prev)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: statusColors[status], fontWeight: 'bold' }}>
                                    {status}
                                </Text>
                                <AntDesign
                                    name={showStatusDropdown ? 'up' : 'down'}
                                    size={16}
                                    color={statusColors[status]}
                                />
                            </TouchableOpacity>
                        </View>

                        {showStatusDropdown && (
                            <View style={styles.dropdown}>
                                {statuses.map((s) => (
                                    <TouchableOpacity
                                        key={s}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setStatus(s);
                                            setShowStatusDropdown(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                { color: statusColors[s], fontWeight: 'bold' },
                                            ]}
                                        >
                                            {s}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Date Picker */}
                        <View style={styles.inputContainer}>
                            <AntDesign name="calendar" size={20} color="#666" style={styles.icon} />
                            <TouchableOpacity
                                style={[styles.input, styles.pickerInput]}
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: '#fff' }}>{dateApplied.toDateString()}</Text>
                                <AntDesign name="calendar" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dateApplied}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                                maximumDate={new Date()}
                            />
                        )}

                        {/* CTC */}
                        <View style={styles.inputContainer}>
                            <AntDesign name="creditcard" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="CTC (e.g., 85000.50)"
                                placeholderTextColor="#999"
                                style={styles.input}
                                keyboardType="decimal-pad"
                                value={ctc}
                                onChangeText={setCtc}
                                returnKeyType="next"
                            />
                        </View>

                        {/* Location */}
                        <View style={styles.inputContainer}>
                            <AntDesign name="enviromento" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="Location"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={location}
                                onChangeText={setLocation}
                                returnKeyType="next"
                            />
                        </View>

                        {/* Techstacks */}
                        <View style={styles.inputContainer}>
                            <AntDesign name="tool" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="Techstacks (comma separated)"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={techstacks}
                                onChangeText={setTechstacks}
                                returnKeyType="next"
                            />
                        </View>

                        {/* Notes */}
                        <View style={[styles.inputContainer, { height: 100 }]}>
                            <AntDesign
                                name="form"
                                size={20}
                                color="#666"
                                style={[styles.icon, { alignSelf: 'flex-start', marginTop: 10 }]}
                            />
                            <TextInput
                                placeholder="Notes"
                                placeholderTextColor="#999"
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                returnKeyType="done"
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && { opacity: 0.6 }]}
                            onPress={saveInDB}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Update Job</Text>
                            )}
                        </TouchableOpacity>
                        {/* Delete Button */}
                        <TouchableOpacity
                            style={[styles.deleteButton, loadingD && { opacity: 0.6 }]}
                            onPress={deleteFromDB}
                            disabled={loading}
                        >
                            {loadingD ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.deleteButtonText}>Delete Job</Text>
                            )}
                        </TouchableOpacity>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            <ThemedAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => {
                    setAlertVisible(false);
                    if (alertTitle === 'Success') {
                        router.back(); // ✅ navigate after closing success alert
                    }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#10192D',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 30,
        alignSelf: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 15,
        height: 50,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    pickerInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdown: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        marginHorizontal: 12,
        marginBottom: 15,
        paddingVertical: 5,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dropdownItemText: {
        color: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3D5AFE',
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#F44336',
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        backgroundColor: 'rgba(30,41,59,0.95)',
        padding: 20,
        borderRadius: 16,
        width: '80%',
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 15,
        color: '#D1D5DB',
        marginBottom: 20,
    },
    alertButton: {
        backgroundColor: '#3D5AFE',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    alertButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

});
