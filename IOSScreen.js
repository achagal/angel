import React from 'react';
//import { WebView } from 'react-native-webview';

const GoogleScreen = () => {
  return (
    <WebView
      source={{ uri: 'https://www.icloud.com/mail' }}
      style={{ flex: 1 }}
    />
  );
};

export default GoogleScreen;