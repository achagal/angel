import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Flight = ({ navigation }) => {
  const buttons = [
    { icon: require('./assets/PlaneFilled.png'), target: "Flight" },
    { icon: require('./assets/Friends.png'), target: "Map" },
    { icon: require('./assets/House.png'), target: "Main" },
    { icon: require('./assets/Chat.png'), target: "Chat" },
    { icon: require('./assets/Profile.png'), target: "Profile" }
  ];

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/LogoWords.png')}
        style={styles.logo}
      />
      <LinearGradient
        colors={['#70349E', '#70349E']}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.addListing}
      >
        <TouchableOpacity
          style={styles.addListingContent}
          onPress={() => navigation.navigate("CreateProfile")}
        >
          <Text style={styles.buttonText}>Add Flight</Text>
        </TouchableOpacity>
      </LinearGradient>
      <View style={styles.buttonRow}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => navigation.navigate(button.target)}
          >
            <Image source={button.icon} style={styles.bottomRow} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Flight;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 135,
    height: 135,
    top: 15,
    left: 5,
    resizeMode: 'contain',
    position: 'absolute',
    zIndex: 1,
  },
  preferencesIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
  preferences: {
    top: 65,
    right: 20,
    zIndex: 1,
    position: 'absolute'
  },
  buttonRow: {
    backgroundColor: '#141414',
    height: 100,
    position: 'absolute',
    bottom: -10,
    borderTopWidth: 1,
    borderTopColor: 'grey',
    flexDirection: 'row',
    width: 390,
    justifyContent: 'space-evenly',
    padding: 5,
  },
  button: {
    backgroundColor: '#141414',
    padding: 10,
    width: 45,
    height: 45,
    marginLeft: 15,
    marginRight: 15,
  },
  bottomRow: {
    width: '100%',
    height: '100%',
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  },
  addListing: {
    width: 360,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 85,
  },
  addListingContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  buttonGrid: {
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: "90%",
    top: 130,
  },
  gridButton: {
    width: 70,
    height: 50,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  gridButtonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 20,
  },
  gridIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
