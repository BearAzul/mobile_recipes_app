import { View, Text, Alert, KeyboardAvoidingView, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSignIn } from '@clerk/clerk-expo'
import { useState } from 'react'
import { authStyles } from '../../assets/styles/auth.styles.js'
import { Image } from 'expo-image'
import { COLORS } from '../../constants/colors.js'
import { Ionicons } from "@expo/vector-icons"

const SignInScreen = () => {
  const router = useRouter()

  const { signIn, setActive, isLoaded } = useSignIn()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password')
      return
    }

    if (!isLoaded) return

    setLoading(true)
    try {
      const signInAction = await signIn.create({
        identifier: email,
        password,
      })

      if (signInAction.status === 'complete') {
        await setActive({ session: signInAction.createdSessionId })
        router.push('/')
      } else {
        Alert.alert('Error', 'Something went wrong during sign in')
        console.error(JSON.stringify(signInAction, null, 2))
      }
    } catch (err) {
      Alert.alert('Error', err.error?.[0]?.message || "Sign In Error")
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }
  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView style={authStyles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={authStyles.imageContainer}>
            <Image source={require("../../assets/images/login.png")} style={authStyles.image} contentFit='contain' />
          </View>
          <Text style={authStyles.title}>Welcome Back!</Text>
          <Text style={authStyles.subtitle}>Sign in to continue to your recipe collection</Text>
          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter Valid Email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter Valid Password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={.8}
            >
              <Text style={authStyles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Text style={authStyles.linkText}>Don&apos;t have an account? <Text style={authStyles.link}>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default SignInScreen