import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import { generateProof } from './Sindri'; // 適切なパスに変更してください

export default function App() {
  const [age, setAge] = useState('');
  const [proofResult, setProofResult] = useState('');

  const handleGenerateProof = async () => {
    try {
      const result = await generateProof(age); // 年齢を渡して証明を生成
      setProofResult('年齢が証明されました');
    } catch (error) {
      setProofResult('証明に失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="年齢を入力"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <Button title="年齢を証明" onPress={handleGenerateProof} />
      {proofResult ? <Text>{proofResult}</Text> : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
});
