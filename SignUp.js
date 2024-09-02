import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, SafeAreaView, Alert } from 'react-native';
import supabase from './supabaseClient';  // Ensure this is the correct path to your Supabase client

const EmailInput = ({ email, setEmail }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.emailInputBox}
      keyboardType="email-address"
      placeholder="Email"
      placeholderTextColor="#434343"
      autoCapitalize="none"
      autoCorrect={false}
      value={email}
      onChangeText={setEmail}
    />
  </View>
);

const PasswordInput = ({ password, setPassword }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.passwordInputBox}
      secureTextEntry={true}
      placeholder="Password"
      placeholderTextColor='#434343'
      autoCapitalize="none"
      autoCorrect={false}
      value={password}
      onChangeText={setPassword}
    />
  </View>
);

const ImageRow = ({ navigation }) => (
  <View style={styles.imageRowContainer}>
    <TouchableOpacity>
      <Image
        source={require('./assets/Blank.png')}
        style={styles.imageStyle}
      />
    </TouchableOpacity>
    <TouchableOpacity>
      <Image
        source={require('./assets/Blank.png')}
        style={styles.imageStyle}
      />
    </TouchableOpacity>
    <TouchableOpacity>
      <Image
        source={require('./assets/Blank.png')}
        style={styles.imageStyle}
      />
    </TouchableOpacity>
  </View>
);

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isButtonDisabled = !email || !password;

  const handleSignUpPress = async () => {
    if (isButtonDisabled) {
        Alert.alert('Please fill in both email and password fields.');
    } else {
        const { error, data } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Error signing up:', error.message);
        } else {
            const userId = data.user?.id;
            if (userId) {
                navigation.navigate('CreateAccount', { userId });
            } else {
                Alert.alert('Error', 'User ID not found.');
            }
        }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <Image 
        source={require('./assets/AppIcon.png')} 
        style={styles.iconStyle}
      />
      {/* <Image 
        source={require('./assets/LogoWords.png')} 
        style={styles.logoStyle}
      /> */}
      <EmailInput email={email} setEmail={setEmail} />
      <PasswordInput password={password} setPassword={setPassword} />
      <TouchableOpacity 
        onPress={handleSignUpPress}
        style={styles.buttonContainer}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <ImageRow navigation={navigation}/>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    bottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    width: 20,
    height: 20,
  },
  backIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageStyle: {
    width: 0,
    height: 60,
    resizeMode: 'contain'
  },
  iconStyle: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    top: 100,
    zIndex: 1,
  },
  // logoStyle: {
  //   width: 600,
  //   height: 350,
  //   top: -160,
  //   resizeMode: 'contain'
  // },
  emailInputBox: {
    position: 'absolute',
    height: 60,
    width: 360,
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    top: 130,
    fontSize: 16,
  },
  passwordInputBox: {
    height: 60,
    width: 360,
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    bottom: 137.5,
    fontSize: 16,
  },
  buttonContainer: {
    backgroundColor: '#70349E',
    width: 360,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 215
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    bottom: -115
  }
});
