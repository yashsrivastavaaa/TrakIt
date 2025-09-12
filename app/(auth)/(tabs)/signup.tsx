import LoginTopBox from '@/components/LoginTopBox';
import { auth } from '@/config/firebaseConfig';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ThemedAlert from '@/components/ThemedAlert'; // ✅ import it
import { pending } from '@/config/pending';
import { pendingSchema } from '@/config/pendingSchema';
import { user } from '@/config/users';
import { userSchema } from '@/config/userSchema';
import { eq } from 'drizzle-orm';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'Success' | 'Error'>('Success');

    const showAlert = (message: string, type: 'Success' | 'Error') => {
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };

    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const createAccount = async () => {
        if (!name || !email || !password || !confirmPassword) {
            showAlert('Please fill out all fields.', 'Error');
            return;
        }

        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address.', 'Error');
            return;
        }

        if (password.length < 6) {
            showAlert('Password should be at least 6 characters long.', 'Error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match.', 'Error');
            return;
        }

        setLoading(true);

        try {
            const existing = await user.select().from(userSchema).where(eq(userSchema.email, email));

            if (existing.length > 0) {
                setAlertMessage('Email already in use. Please sign in.');
                setAlertType('Error');
                setAlertVisible(true);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error('Error checking existing users:', error);
            setAlertMessage('Something went wrong. Please try again.');
            setAlertType('Error');
            setAlertVisible(true);
            setLoading(false);
            return;
        }


        try {
            const existing = await pending.select().from(pendingSchema).where(eq(pendingSchema.email, email));

            if (existing.length > 0) {
                setAlertMessage('Verification mail already sent. Please verify it.');
                setAlertType('Error');
                setAlertVisible(true);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error('Error checking existing users:', error);
            setAlertMessage('Something went wrong. Please try again.');
            setAlertType('Error');
            setAlertVisible(true);
            setLoading(false);
            return;
        }


        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            setAlertMessage('Verification email sent! Please check your inbox.');
            setAlertType('Success'); // ✅ FIXED: should be "Success"
            setAlertVisible(true);
        } catch (error) {
            console.log('Error creating user:', error);
            setAlertMessage('Unable to send mail. Please try again.');
            setAlertType('Error'); // ✅ FIXED: should be "Error"
            setAlertVisible(true);
            setLoading(false);
            return;
        } finally {
            setLoading(false);
        }

        try {
            const result = await pending.insert(pendingSchema).values({
                name,
                email,
                password
            });
        } catch (error) {
            setAlertMessage('Something went wrong. Please try again.');
            setAlertType('Error');
            setAlertVisible(true);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={{ textAlign: 'center', color: 'white' }}>v1.2</Text>
                    <LoginTopBox />
                    <Text style={styles.header}>Create Account</Text>
                    <Text style={styles.subtext}>Join us today</Text>

                    {/* Full Name */}
                    <View style={styles.inputContainer}>
                        <FontAwesome name="user" size={22} color="#ccc" style={styles.icon} />
                        <TextInput
                            placeholder="Full Name"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                            keyboardType="default"
                            autoCapitalize="words"
                            value={name}
                            onChangeText={setname}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={22} color="#ccc" style={styles.icon} />
                        <TextInput
                            placeholder="Enter Your Email ID"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Entypo name="lock" size={22} color="#ccc" style={styles.icon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                            <Entypo
                                name={showPassword ? 'eye' : 'eye-with-line'}
                                size={22}
                                color="#ccc"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <Entypo name="lock" size={22} color="#ccc" style={styles.icon} />
                        <TextInput
                            placeholder="Confirm Password"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                            <Entypo
                                name={showPassword ? 'eye' : 'eye-with-line'}
                                size={22}
                                color="#ccc"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={styles.signUpButton}
                        disabled={loading}
                        onPress={createAccount}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.signUpButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>

                {/* ✅ Themed Alert */}
                <ThemedAlert
                    visible={alertVisible}
                    message={alertMessage}
                    title={alertType}
                    onClose={() => {
                        setAlertVisible(false)
                        if (alertType === 'Success') {
                            router.replace('/(auth)/(tabs)/signin');
                        }
                    }
                    }
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(7,16,33)',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        marginLeft: 25,
        fontSize: 20,
        marginTop: 70,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtext: {
        marginLeft: 25,
        fontSize: 15,
        marginTop: 10,
        color: '#aaa',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10192D',
        marginHorizontal: 20,
        borderRadius: 30,
        paddingHorizontal: 20,
        height: 50,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#444',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
    },
    signUpButton: {
        backgroundColor: '#3D5AFE',
        width: '90%',
        height: 50,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 50,
    },
    signUpButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});



