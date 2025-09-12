import { jobs } from '@/config/jobs';
import { jobSchema } from '@/config/jobSchema';
import { AuthContext } from '@/context/AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';
import { and, desc, eq, gte, isNotNull, or, sql } from 'drizzle-orm';
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

function getStartOfWeek() {
    const now = new Date();
    const day = now.getDay(); // Sunday = 0, Monday = 1, ...
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(now.setDate(diff));
}

function getStartOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function HomeScreen() {
    const { userData } = useContext(AuthContext);
    const router = useRouter();

    const [count, setCount] = useState(0);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // New states for applied this week/month/total
    const [appliedThisWeek, setAppliedThisWeek] = useState(0);
    const [appliedThisMonth, setAppliedThisMonth] = useState(0);
    const [totalApplications, setTotalApplications] = useState(0);

    // ✅ Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

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

    const [horizontalScrollData, setHorizontalScrollData] = useState<any[]>([]);

    // Fetch jobs data
    const fetchHorizontalScrollData = async () => {
        const data = await jobs
            .select()
            .from(jobSchema)
            .where(
                or(
                    and(
                        eq(jobSchema.user_email, userData.email),
                        isNotNull(jobSchema.tag),
                        sql`TRIM(${jobSchema.tag}) != ''`
                    ),
                    eq(jobSchema.status, 'Yet to Apply')
                )
            )
            .orderBy(
                sql`
      CASE 
        WHEN ${jobSchema.status} = 'yet to apply' THEN ${jobSchema.application_deadline}
        ELSE ${jobSchema.important_date}
      END ASC
    `
            );



        console.log("Horizontal Scroll Data:", data); // Debugging log
        return data;
    };

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const data = await fetchHorizontalScrollData();
                setHorizontalScrollData(data);
            };

            loadData();

            // Optional cleanup if needed
            return () => { };
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            async function fetchJobsData() {
                try {
                    setLoading(true);

                    // Total jobs count
                    const allJobs = await jobs
                        .select()
                        .from(jobSchema)
                        .where(eq(jobSchema.user_email, userData.email));

                    setTotalApplications(allJobs.length || 0);

                    // Applications in progress count (same as before)
                    const inProgressCount = allJobs.length;
                    setCount(inProgressCount);

                    // Recent jobs (latest 3)
                    const latest = await jobs
                        .select()
                        .from(jobSchema)
                        .where(eq(jobSchema.user_email, userData.email))
                        .orderBy(desc(jobSchema.created_at))
                        .limit(3);
                    //@ts-ignore
                    setRecentJobs(latest);

                    // Calculate applied this week
                    const startOfWeek = getStartOfWeek();
                    const startOfMonth = getStartOfMonth();

                    // Convert to ISO strings for query (assuming date_applied stored as ISO string or Date)
                    const startWeekISO = startOfWeek.toISOString();
                    const startMonthISO = startOfMonth.toISOString();

                    // Applied This Week

                    const appliedWeekResult = await jobs
                        .select()
                        .from(jobSchema)
                        .where(
                            eq(jobSchema.user_email, userData.email),
                            //@ts-ignore
                            gte(jobSchema.date_applied, startWeekISO)
                        );

                    setAppliedThisWeek(appliedWeekResult.length || 0);

                    // Applied This Month
                    const appliedMonthResult = await jobs
                        .select()
                        .from(jobSchema)
                        .where(
                            eq(jobSchema.user_email, userData.email),
                            //@ts-ignore
                            gte(jobSchema.date_applied, startMonthISO)
                        );

                    setAppliedThisMonth(appliedMonthResult.length || 0);

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


                <View style={styles.topSummaryContainer}>
                    <View style={styles.smallSummaryBox}>
                        <AntDesign name="calendar" size={18} color="#3D5AFE" />
                        <Text style={styles.smallSummaryNumber}>{appliedThisWeek}</Text>
                        <View style={styles.iconLabelRow}>
                            <Text style={styles.smallSummaryLabel}>This Week</Text>
                        </View>
                    </View>

                    <View style={styles.smallSummaryBox}>
                        <AntDesign name="clockcircleo" size={18} color="#3D5AFE" />
                        <Text style={styles.smallSummaryNumber}>{appliedThisMonth}</Text>
                        <View style={styles.iconLabelRow}>
                            <Text style={styles.smallSummaryLabel}>This Month</Text>
                        </View>
                    </View>


                </View>


                {/* Summary Section */}
                <TouchableOpacity onPress={() => router.push('/platform/screens/viewJobScreen')}>
                    <View style={styles.summaryBox}>
                        <AntDesign name="filetext1" size={28} color="#3D5AFE" style={styles.summaryIcon} />
                        <Text style={styles.summaryNumber}>{count}</Text>
                        <Text style={styles.summaryLabel}>Applications in Progress</Text>
                    </View>
                </TouchableOpacity>

                {/* Actions */}

                <View style={styles.actions}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>
                        Quick Actions
                    </Text>
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


                {horizontalScrollData.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.horzSlider_title}>Upcoming Events</Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.horzSlider_scrollContainer}
                            contentContainerStyle={styles.horzSlider_cardContainer}
                        >
                            {horizontalScrollData.map((jobData: any) => {
                                const isDeadline = jobData.status === 'yet to apply';
                                const displayDate = isDeadline ? jobData.application_deadline : jobData.important_date;
                                const tagPresent = jobData.tag && jobData.tag.trim() !== '';

                                return (
                                    <TouchableOpacity
                                        key={jobData.job_id}
                                        style={styles.horzSlider_card}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            router.push({
                                                pathname: '/platform/screens/editScreen',
                                                params: {
                                                    email: userData.email,
                                                    company_name: jobData.company_name,
                                                    status: jobData.status,
                                                    role: jobData.role,
                                                    date_applied: jobData.date_applied,
                                                    notes: jobData.notes,
                                                    ctc: jobData.ctc,
                                                    location: jobData.location,
                                                    techstacks: JSON.stringify(jobData.techstacks),
                                                    id: jobData.job_id,
                                                },
                                            });
                                        }}
                                    >
                                        <Text style={styles.horzSlider_cardText}>
                                            {jobData.company_name} - {jobData.role}
                                        </Text>

                                        {/* Show tag if available, otherwise show deadline */}
                                        {tagPresent ? (
                                            <Text style={styles.horzSlider_tagText}>
                                                Tag: {jobData.tag}
                                            </Text>
                                        ) : (
                                            <Text style={styles.horzSlider_cardSubText}>
                                                Deadline to fill form: {jobData.application_deadline}
                                            </Text>
                                        )}

                                        {/* Always show the main date (important or deadline) */}
                                        <Text style={styles.horzSlider_cardSubText}>
                                            {isDeadline && tagPresent ? 'Deadline:' : 'Important Date:'} {displayDate}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}


                {/* Recent Applications */}
                <View style={{ marginTop: 10 }}>
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

                {!loading && recentJobs.length !== 0 ? (
                    <TouchableOpacity onPress={() => router.push('/platform/screens/viewJobScreen')}>
                        <Text style={{ color: '#3D5AFE', marginTop: 2, marginBottom: 60, textAlign: 'center' }}>
                            View all applications
                        </Text>
                    </TouchableOpacity>
                ) : null}

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

    topSummaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    smallSummaryBox: {
        flex: 1,
        backgroundColor: 'rgba(30,41,59,0.9)',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    smallSummaryNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginTop: 4,
    },
    summaryIcon: {
        marginBottom: 12,
    },
    smallSummaryLabel: {
        fontSize: 14,
        color: '#E5E7EB',
    },
    iconLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    summaryBox: {
        backgroundColor: 'rgba(30,41,59,0.9)',
        borderRadius: 16,
        padding: 25,
        marginTop: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    summaryNumber: { fontSize: 42, fontWeight: '800', color: 'white' },
    summaryLabel: { fontSize: 15, color: '#E5E7EB', marginTop: 6 },
    horzSlider_tagText: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 4,
    },

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
    actions: { marginTop: 10, gap: 15 },
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
        marginTop: -5,
    },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 10 },
    lastCard: { marginBottom: 20 },

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
    horzSlider_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',

    },
    horzSlider_scrollContainer: {
        paddingVertical: 10,
    },
    horzSlider_cardContainer: {
        paddingHorizontal: 10,
    },
    horzSlider_card: {
        backgroundColor: 'rgba(30,41,59,0.95)',
        borderRadius: 10,
        padding: 15,
        marginRight: 10,
        width: 200,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    horzSlider_cardText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#fff',
    },
    horzSlider_cardSubText: {
        fontSize: 14,
        color: '#E5E7EB',
    },
});
