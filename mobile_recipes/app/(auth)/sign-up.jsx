import { View, Text, Alert, KeyboardAvoidingView, ScrollView, Platform, TextInput, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSignUp } from '@clerk/clerk-expo'
import { useState } from 'react'
import { authStyles } from '../../assets/styles/auth.styles.js'
import { Image } from 'expo-image'
import { COLORS } from "../../constants/colors.js"
import { Ionicons } from "@expo/vector-icons"
import VerifyEmailScreen from './verify-email.jsx'

const SignUpScreen = () => {
  const router = useRouter()

  const { signUp, isLoaded } = useSignUp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter your email and password')

    if (password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters long')

    if (!isLoaded) return

    setLoading(true)
    try {
      await signUp.create({
        emailAddress: email,
        password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      setPendingVerification(true)
    } catch (error) {
      Alert.alert('Error', error.error?.[0]?.message || "Sign Up Error")
      console.error(JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return <VerifyEmailScreen email={email} onBack={() => setPendingVerification(false)} />
  }

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView style={authStyles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={authStyles.imageContainer}>
            <Image source={require("../../assets/images/register.png")} style={authStyles.image} contentFit='contain' />
          </View>
          <Text style={authStyles.title}>Create an Account</Text>
          <Text style={authStyles.subtitle}>Sign up to start collect your recipe collection</Text>
          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter Email"
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
                placeholder="Enter Password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity style={authStyles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={.8}
            >
              <Text style={authStyles.buttonText}>{loading ? "Signing Up..." : "Sign Up"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.back()}>
              <Text style={authStyles.linkText}>
                Already have an account? <Text style={authStyles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default SignUpScreen