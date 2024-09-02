import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Notifications = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    messages: true,
    reminders: false,
    newMatches: true,
    listingUpdates: false,
    paymentReminders: true,
  });

  const toggleSwitch = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const notifications = [
    {
      key: 'messages',
      title: 'Messages',
      description: 'Keep track of all your conversations.',
    },
    {
      key: 'reminders',
      title: 'Reminders',
      description: "Don't miss important dates and actions needed.",
    },
    {
      key: 'newMatches',
      title: 'New Matches',
      description: 'Alerts when new properties matching your preferences are listed.',
    },
    {
      key: 'listingUpdates',
      title: 'Listing Updates',
      description: "Stay updated on changes to properties you're interested in.",
    },
    {
      key: 'paymentReminders',
      title: 'Payment Reminders',
      description: 'Timely reminders to ensure your payments are always on track.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
        </TouchableOpacity>
        < Text style={styles.titleText}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notifications.map((notification) => (
          <View key={notification.key} style={styles.notificationContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.description}>{notification.description}</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings[notification.key] ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSwitch(notification.key)}
              value={settings[notification.key]}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    padding: 20,
  },
  headerContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 30,
  },
  topBanner: {
    position: 'absolute',
    width: '100%',
    height: 95,
    flexDirecton: 'row',
    justifyContent: 'center',
    alignContent: 'center',
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
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    top: 60,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: {
    marginTop: 50,
    padding: 20,
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 12,
    color: '#777',
  }, 
  textContainer: {
    flex: 1,
  },
});

