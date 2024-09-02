import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TermsOfService = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
       <View style={styles.topBanner}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Terms Of Service</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Image source={require('./assets/TOS/TermsOfService-01.png')} style={styles.policyImageTop} />
        <Image source={require('./assets/TOS/TermsOfService-02.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-03.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-04.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-05.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-06.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-07.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-09.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-10.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-11.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-12.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-13.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-14.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-15.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-16.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-17.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-18.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-19.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-20.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-21.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-22.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-23.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-24.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-25.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-26.png')} style={styles.policyImage} />
        <Image source={require('./assets/TOS/TermsOfService-27.png')} style={styles.policyImage} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    flexDirection: 'column',
    top: 25,
    justifyContent: 'center',
    alignContent: 'center'
  },
  policyImageTop: {
    width: 500,
    height: 500, 
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -10,
  },
  policyImage: {
    width: 500,
    height: 500, 
    resizeMode: 'contain',
    alignSelf: 'center',
  },
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
    padding: 20,
    marginTop: 60, // Ensure the content starts below the back button
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
});

export default TermsOfService;
