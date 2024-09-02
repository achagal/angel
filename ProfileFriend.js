import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import useRoute and useNavigation
import supabase from './supabaseClient';
import Matches from './Matches';

const ProfileFriend = ({ navigation }) => {
  const route = useRoute(); // Use useRoute to access route parameters
  const nav = useNavigation(); // Use useNavigation for the back button
  const userId = route.params?.userId; // Get the user ID from the route parameters
  const [profile, setProfile] = useState({
    name: '',
    school: '',
    bio: '',
    profile_pic: ''
  });
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, school, profile_pic')
          .eq('id', userId)
          .single();

        if (error) {
          // console.error('Error fetching profile:', error.message);
        } else {
          setProfile(data);
          if (data.profile_pic) {
            setImageUri(data.profile_pic);
          }
        }
      }
    };

    fetchProfile();
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => nav.goBack()}>
        <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <Image
        source={imageUri ? { uri: imageUri } : require('./assets/InsertProfilePic.png')}
        style={imageUri ? styles.insertProfStyle : styles.profPicStyle}
      />
      <View contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label1}>{profile.name}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label2}>{profile.school}</Text>
          <View style={styles.underline} />
        </View>
      </View>
      <View style={styles.bottomHalf}>
        <Matches navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default ProfileFriend;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  bottomHalf: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginTop: 70,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    width: 20,
    height: 20,
  },
  backIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  logo: {
    width: 135,
    height: 135,
    top: 15,
    left: 5,
    resizeMode: 'contain',
    position: 'absolute'
  },
  scrollContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
  },
  profPicStyle: {
    width: 125,
    height: 125,
    resizeMode: 'contain',
    borderRadius: 250,
    top: 75,
    marginBottom: 30,
  },
  insertProfStyle: {
    width: 115,
    height: 115,
    borderWidth: 0,
    borderColor: 'grey',
    resizeMode: 'contain',
    borderRadius: 250,
    top: 75,
    backgroundColor: 'white',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
    width: 375,
    bottom: 20,
  },
  bioContainer: {
    marginBottom: 20,
    width: 375,
  },
  label1: {
    color: 'white',
    fontSize: 24,
    top: 90,
    left: 20,
    marginTop: -10,
    marginBottom: -10,
    fontWeight: 'bold',
  },
  label2: {
    color: 'white',
    fontSize: 18,
    top: 90,
    left: 20,
    marginBottom: -5,
    fontWeight: 'bold',
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#70349E',
    top: 110,
    marginTop: 5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  bioInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    height: 'auto',
    width: 375,
  },
  boxText: {
    fontSize: 16,
    color: 'black',
  },
});
