import React from "react";
import { StyleSheet, Text, View, TouchableHighlight, TouchableOpacity, TextInput, Image, Alert, Platform, SafeAreaView, Button } from 'react-native';
import 'react-native-gesture-handler';
import { usePushNotifications } from "./useExpoNotifications";

import AppNavigator from './Navigator';

export default function App() {
  const {expoPushToken, notification} = usePushNotifications()

  const data = JSON.stringify(notification, undefined, 2);

  return <AppNavigator />;
}