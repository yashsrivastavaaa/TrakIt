import { jobs } from '@/config/jobs';
import { jobSchema } from '@/config/jobSchema';
import { AuthContext } from '@/context/AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
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

/*     resume_link: text('resume_link'),
    bond_duration: integer('bond_duration'), // in months
    bond_fine: numeric('bond_fine', { precision: 10, scale: 2 }),
    stipend: numeric('stipend', { precision: 10, scale: 2 }),
    intern_duration: integer('intern_duration'), // number (e.g. months)
    application_deadline: date('application_deadline'),
    important_date: date('important_date'),
    tag: varchar('tag', { length: 100 }),

*/

export default function AddJobScreen() {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('Applied');
    const [dateApplied, setDateApplied] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [notes, setNotes] = useState('');
    const [ctc, setCtc] = useState('');
    const [location, setLocation] = useState('');
    const [techstacks, setTechstacks] = useState('');
    const [loading, setLoading] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [resume_link, setResumeLink] = useState('');
    const [bond_duration, setBondDuration] = useState('');
    const [bond_fine, setBondFine] = useState('');
    const [stipend, setStipend] = useState(''); // in months
    const [intern_duration, setInternDuration] = useState('');
    const [application_deadline, setApplicationDeadline] = useState(new Date());
    const [important_date, setImportantDate] = useState(new Date());
    const [tag, setTag] = useState('');
    const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
    const [showImportantDatePicker, setShowImportantDatePicker] = useState(false);


    const { userData } = useContext(AuthContext);

    const statuses = [
        'Yet to Apply',
        'Applied',
        'Shortlisted',
        'Assessment Completed',
        'Interview Scheduled',
        'Interviewing',
        'Offered',
        'Accepted',
        'Rejected',
        'Withdrawn',
    ];

    const statusColors: { [key: string]: string } = {
        'Yet to Apply': '#9E9E9E',         // Neutral Grey
        'Applied': '#4CAF50',              // Success Green
        'Shortlisted': '#03A9F4',          // Light Blue
        'Assessment Completed': '#FFC107', // Amber
        'Interview Scheduled': '#00BCD4',  // Cyan
        'Interviewing': '#3F51B5',         // Indigo
        'Offered': '#FF9800',              // Orange
        'Accepted': '#8BC34A',             // Light Green
        'Rejected': '#F44336',             // Red
        'Withdrawn': '#795548',            // Brown
    };


    const onChangeDate = (_: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateApplied(selectedDate);
        }
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

        setLoading(true);
        try {

            if (stipend === '') {
                setStipend('0');
            }
            if (bond_fine === '') {
                setBondFine('0');
            }
            if (bond_duration === '') {
                setBondDuration('0');
            }
            if (intern_duration === '') {
                setInternDuration('0');
            }
            if (ctc === '') {
                setCtc('0');
            }
            if (techstacks === '') {
                setAlertTitle('Error');
                setAlertMessage('Techstacks are required.');
                setAlertVisible(true);
                return;
            }
            if (location === '') {
                setAlertTitle('Error');
                setAlertMessage('Location is required.');
                setAlertVisible(true);
                return;
            }

            const result = await jobs.insert(jobSchema).values({
                user_email: userData.email,
                company_name: company,
                role,
                status,
                date_applied: dateApplied.toISOString().split('T')[0],
                ctc: ctc,
                location: location,
                techstacks: techstacks ? techstacks.split(',').map((t) => t.trim()) : null,
                notes: notes || null,
                resume_link: resume_link || null,
                bond_duration: bond_duration ? parseInt(bond_duration) : null,
                bond_fine: bond_fine,
                stipend: stipend,
                intern_duration: intern_duration ? parseInt(intern_duration) : null,
                application_deadline: application_deadline.toISOString().split('T')[0],
                important_date: important_date.toISOString().split('T')[0],
                tag: tag,
            });



            console.log('Inserted:', result);

            setAlertTitle('Success');
            setAlertMessage('Job Added Successfully.');
            setAlertVisible(true);

            // clear form
            setCompany('');
            setRole('');
            setStatus('Applied');
            setDateApplied(new Date());
            setNotes('');
            setCtc('');
            setLocation('');
            setTechstacks('');
        } catch (error) {
            console.error('DB Insert Error:', error);
            setAlertTitle('Error');
            setAlertMessage('Unable to add job.');
            setAlertVisible(true);
        } finally {
            setLoading(false);
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
                        showsVerticalScrollIndicator={false}  // hide scroll bar
                    >
                        <Text style={styles.header}>Add New Job</Text>

                        <Text style={styles.label}>Company Name</Text>
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

                        <Text style={styles.label}>Role</Text>
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

                        <Text style={styles.label}>Application Status</Text>
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

                        <Text style={styles.label}>Application Date</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="calendar" size={20} color="#666" style={styles.icon} />
                            <TouchableOpacity
                                style={[styles.input, styles.pickerInput]}
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: '#fff' }}>
                                    {dateApplied.toDateString()}
                                </Text>
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

                        <Text style={styles.label}>CTC</Text>
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

                        <Text style={styles.label}>Location</Text>
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

                        <Text style={styles.label}>Tech Stacks</Text>
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

                        <Text style={styles.label}>Notes</Text>
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
                        <Text style={styles.label}>Resume Link</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="link" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="Resume Link"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={resume_link}
                                onChangeText={setResumeLink}
                                returnKeyType="next"
                                autoCapitalize="none"
                            />
                        </View>

                        <Text style={styles.label}>Bond Duration (in months)</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="clockcircleo" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="e.g., 24"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={bond_duration}
                                onChangeText={setBondDuration}
                                keyboardType="numeric"
                                returnKeyType="next"
                            />
                        </View>

                        <Text style={styles.label}>Bond Fine (₹)</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="warning" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="e.g., 50000"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={bond_fine}
                                onChangeText={setBondFine}
                                keyboardType="numeric"
                                returnKeyType="next"
                            />
                        </View>

                        <Text style={styles.label}>Stipend (monthly ₹)</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="pay-circle1" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="e.g., 15000"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={stipend}
                                onChangeText={setStipend}
                                keyboardType="numeric"
                                returnKeyType="next"
                            />
                        </View>

                        <Text style={styles.label}>Internship Duration (in months)</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="calendar" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="e.g., 6"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={intern_duration}
                                onChangeText={setInternDuration}
                                keyboardType="numeric"
                                returnKeyType="next"
                            />
                        </View>

                        <Text style={styles.label}>Application Deadline</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="calendar" size={20} color="#666" style={styles.icon} />
                            <TouchableOpacity
                                style={[styles.input, styles.pickerInput]}
                                onPress={() => setShowDeadlinePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: '#fff' }}>
                                    {application_deadline.toDateString()}
                                </Text>
                                <AntDesign name="calendar" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {showDeadlinePicker && (
                            <DateTimePicker
                                value={application_deadline}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDeadlinePicker(false);
                                    if (selectedDate) setApplicationDeadline(selectedDate);
                                }}
                            />
                        )}

                        <Text style={styles.label}>Important Date</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="calendar" size={20} color="#666" style={styles.icon} />
                            <TouchableOpacity
                                style={[styles.input, styles.pickerInput]}
                                onPress={() => setShowImportantDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: '#fff' }}>
                                    {important_date.toDateString()}
                                </Text>
                                <AntDesign name="calendar" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {showImportantDatePicker && (
                            <DateTimePicker
                                value={important_date}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowImportantDatePicker(false);
                                    if (selectedDate) setImportantDate(selectedDate);
                                }}
                            />
                        )}

                        <Text style={styles.label}>Tag for important date</Text>
                        <View style={styles.inputContainer}>
                            <AntDesign name="tag" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                placeholder="e.g., Interview/Assessment"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={tag}
                                onChangeText={setTag}
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
                                <Text style={styles.buttonText}>Add Job</Text>
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
                        router.replace('/platform/home'); // ✅ navigate after closing success alert
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
    label: {
        color: "#AAAAAA",
        fontSize: 14,
        marginBottom: 6,
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
