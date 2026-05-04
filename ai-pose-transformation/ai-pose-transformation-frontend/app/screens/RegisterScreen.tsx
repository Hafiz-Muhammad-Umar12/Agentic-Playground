import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../services/authStore';

export default function RegisterScreen() {
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' });
  const { register, loading, error } = useAuthStore();

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password)
      return Alert.alert('Error', 'Username, email & password are required');
    const ok = await register(form.username, form.email, form.password, form.full_name);
    if (ok) {
      Alert.alert('Success! 🎉', 'Account created. Please login.');
      router.replace('/screens/LoginScreen');
    } else {
      Alert.alert('Error', error || 'Registration failed');
    }
  };

  const update = (key: string, val: string) => setForm({ ...form, [key]: val });

  return (
    <LinearGradient colors={['#0a0a0a', '#111827', '#0a0a0a']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your AI pose journey</Text>
          </View>

          {[
            { key: 'full_name', label: 'Full Name (optional)', placeholder: 'John Doe', secure: false },
            { key: 'username',  label: 'Username *',           placeholder: 'johnDoe',  secure: false },
            { key: 'email',     label: 'Email *',              placeholder: 'you@example.com', secure: false },
            { key: 'password',  label: 'Password *',           placeholder: '••••••••', secure: true },
          ].map((field) => (
            <View key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={form[field.key as keyof typeof form]}
                onChangeText={(v) => update(field.key, v)}
                placeholder={field.placeholder}
                placeholderTextColor="#4B5563"
                secureTextEntry={field.secure}
                autoCapitalize="none"
                keyboardType={field.key === 'email' ? 'email-address' : 'default'}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>Already have an account? <Text style={styles.linkAccent}>Login</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  inner:      { padding: 28, paddingTop: 80, gap: 10 },
  header:     { marginBottom: 32 },
  title:      { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  subtitle:   { fontSize: 14, color: '#6B7280', marginTop: 6 },
  label:      { color: '#9CA3AF', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  input:      { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', borderRadius: 14, padding: 16, color: '#fff', fontSize: 15, marginBottom: 8 },
  btn:        { backgroundColor: '#00FFB2', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  btnText:    { color: '#000', fontWeight: '800', fontSize: 16 },
  link:       { color: '#6B7280', textAlign: 'center', marginTop: 20, fontSize: 14 },
  linkAccent: { color: '#00FFB2', fontWeight: '700' },
});
