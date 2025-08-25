import { jobs } from '@/config/jobs';
import { jobSchema } from '@/config/jobSchema';
import { AuthContext } from '@/context/AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import { desc, eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ ThemedAlert Component (dark mode styled)
const ThemedAlert = ({ visible, message, onClose }: { visible: boolean; message: string; onClose: () => void }) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.alertOverlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.alertMessage}>{message}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.alertButton}>
                        <Text style={styles.alertButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function HomeScreen() {
    const { userData } = useContext(AuthContext);
    const router = useRouter();

    const [count, setCount] = useState(0);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const statusColors: { [key: string]: string } = {
        Applied: '#4CAF50',
        Interviewing: '#2196F3',
        Offered: '#FF9800',
        Rejected: '#F44336',
        Accepted: '#9C27B0',
    };

    useFocusEffect(
        useCallback(() => {
            async function fetchJobsData() {
                try {
                    setLoading(true);
                    const result = await jobs
                        .select()
                        .from(jobSchema)
                        .where(eq(jobSchema.user_email, userData.email));

                    setCount(result.length || 0);

                    // Fetch 5 recent jobs
                    const latest = await jobs
                        .select()
                        .from(jobSchema)
                        .where(eq(jobSchema.user_email, userData.email))
                        .orderBy(desc(jobSchema.created_at))
                        .limit(5);

                    //@ts-ignore
                    setRecentJobs(latest);



                } catch (e) {
                    console.error('Fetch error:', e);
                    setAlertTitle('Error');
                    setAlertMessage('Something went wrong. Please try again ❌');
                    setAlertVisible(true);
                } finally {
                    setLoading(false);
                }
            }

            fetchJobsData();
        }, [userData.email])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.welcome}>Welcome Back 👋</Text>
                <Text style={styles.subheading}>Here's your job tracking summary</Text>

                {/* Summary Section */}
                <TouchableOpacity onPress={() => router.push('/platform/screens/viewJobScreen')}>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryNumber}>{count}</Text>
                        <Text style={styles.summaryLabel}>Applications in Progress</Text>
                    </View>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('../screens/addnewjob')}
                    >
                        <AntDesign name="pluscircleo" size={20} color="#3D5AFE" />
                        <Text style={styles.buttonText}>Add New Job</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('../screens/viewJobScreen')}
                    >
                        <AntDesign name="profile" size={20} color="#3D5AFE" />
                        <Text style={styles.buttonText}>View All Jobs</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Applications */}
                <View style={{ marginTop: 30 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>
                        Recent Applications
                    </Text>

                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color="#3D5AFE"
                            style={{ marginTop: 20 }}
                        />
                    ) : recentJobs.length === 0 ? (
                        <Text style={{ color: '#AAAAAA', marginTop: 10 }}>No recent jobs found</Text>
                    ) : (
                        recentJobs.map((job: any, index) => (
                            <TouchableOpacity
                                key={job.job_id || index}
                                onPress={() => {
                                    router.push({
                                        pathname: '/platform/screens/editScreen',
                                        params: {
                                            email: userData.email,
                                            company_name: job.company_name,
                                            status: job.status,
                                            role: job.role,
                                            date_applied: job.date_applied,
                                            notes: job.notes,
                                            ctc: job.ctc,
                                            location: job.location,
                                            techstacks: JSON.stringify(job.techstacks),
                                            id: job.job_id,
                                        },
                                    });
                                }}
                            >
                                <View
                                    style={[styles.card, index === recentJobs.length - 1 && styles.lastCard]}
                                >
                                    <View style={styles.row}>
                                        <Text style={styles.company}>{job.company_name}</Text>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: statusColors[job.status] || '#666' },
                                            ]}
                                        >
                                            <Text style={styles.statusText}>{job.status}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.role}>{job.role}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* ✅ Themed Alert */}
            <ThemedAlert
                visible={alertVisible}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A1124' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    welcome: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
    subheading: { fontSize: 15, color: '#9CA3AF', marginTop: 6 },
    summaryBox: {
        backgroundColor: 'rgba(30,41,59,0.9)',
        borderRadius: 16,
        padding: 25,
        marginTop: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    summaryNumber: { fontSize: 42, fontWeight: '800', color: '#3D5AFE' },
    summaryLabel: { fontSize: 15, color: '#E5E7EB', marginTop: 6 },
    card: {
        backgroundColor: 'rgba(30,41,59,0.95)',
        borderRadius: 16,
        padding: 18,
        marginTop: 15,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    company: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    role: { fontSize: 15, color: '#D1D5DB', marginTop: 6 },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    statusText: { color: '#fff', fontWeight: '600', fontSize: 12 },
    actions: { marginTop: 40, gap: 15 },
    button: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30,41,59,0.95)',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 10 },
    lastCard: { marginBottom: 50 },

    // ✅ ThemedAlert styles
    alertOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    alertBox: {
        width: '80%',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    alertMessage: { color: '#E5E7EB', fontSize: 16, textAlign: 'center', marginBottom: 15 },
    alertButton: {
        backgroundColor: '#3D5AFE',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    alertButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
