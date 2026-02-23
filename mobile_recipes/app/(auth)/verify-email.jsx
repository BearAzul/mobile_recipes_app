import { View, Text, Alert, KeyboardAvoidingView, ScrollView, Platform, TextInput, TouchableOpacity } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { useState } from 'react'
import { authStyles } from '../../assets/styles/auth.styles.js'
import { Image } from 'expo-image'

const VerifyEmailScreen = ({ email, onBack }) => {
  const { signUp, isLoaded, setActive } = useSignUp()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => { 
    if(!isLoaded) return

    setLoading(true)
    try {
      const signUpAction = await signUp.attemptEmailAddressVerification({ code })
      if (signUpAction.status === 'complete') { 
        await setActive({ session: signUpAction.createdSessionId })
      } else {
        Alert.alert('Error', 'Something went wrong during email verification')
        console.error(JSON.stringify(signUpAction, null, 2))
      }
    } catch (error) {
      Alert.alert('Error', error.error?.[0]?.message || "Verification Error")
      console.error(JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
    }
  }
  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        style={authStyles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/auth.png")}
              style={authStyles.image}
              contentFit='contain'
            />
          </View>
          <Text style={authStyles.title}>Verify Your Email</Text>
          <Text style={authStyles.subtitle}>We emailed you the code to {email}</Text>
          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                placeholder="Enter verification code"
                value={code}
                onChangeText={setCode}
                style={authStyles.textInput}
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
                autoCapitalize='none'
              />
            </View>

            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]} 
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={.8}
            >
              <Text style={authStyles.buttonText}>{loading ? "Verifying..." : "Verify Email"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.linkContainer} onPress={onBack} activeOpacity={.8}>
              <Text style={authStyles.linkText}>
                <Text style={authStyles.link}>
                  Back to Sign Up
                </Text>
              </Text>
            </TouchableOpacity>
         </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default VerifyEmailScreen