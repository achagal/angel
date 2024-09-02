import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Image, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Privacy Policy</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Image source={require('./assets/PrivacyPolicy-1.png')} style={styles.policyImageTop} />
        <Image source={require('./assets/PrivacyPolicy-2.png')} style={styles.policyImage} />
        <Image source={require('./assets/PrivacyPolicy-3.png')} style={styles.policyImage} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  topBanner: {
    position: 'absolute',
    width: '100%',
    height: 95,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    zIndex: 1,
    padding: 10,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#70349E',
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    top: 25,
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
  scrollView: {
    marginTop: 60, // Ensure the content starts below the back button
  },
  contentContainer: {
    width: '100%',
    flexDirection: 'column',
    top: 25,
  },
  policyImageTop: {
    width: '100%', // Adjust based on your image size
    height: 500, // Adjust based on your image size
    resizeMode: 'contain',
  },
  policyImage: {
    width: '100%', // Adjust based on your image size
    height: 500, // Adjust based on your image size
    resizeMode: 'contain',
    marginTop: -102
  },
});

export default PrivacyPolicy;
