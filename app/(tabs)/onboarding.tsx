import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const [perche, setPerche] = useState('');
  const [spesa, setSpesa] = useState('');

  const inizia = async () => {
    if (!perche || !spesa) return;
    await AsyncStorageLib.setItem('dataInizio', new Date().toISOString());
    await AsyncStorageLib.setItem('spesaGiornaliera', spesa);
    await AsyncStorageLib.setItem('perche', perche);
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🤲</Text>
        <Text style={styles.heroTitolo}>Ancora Qui.</Text>
        <Text style={styles.heroSub}>Non sei solo. Iniziamo insieme — un giorno alla volta.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLbl}>IL TUO PERCHÉ</Text>
        <Text style={styles.cardDesc}>Cosa ti ha fatto scegliere di cambiare?</Text>
        <TextInput
          style={styles.input}
          placeholder="Es. per mio figlio, per la mia famiglia..."
          placeholderTextColor="#5a5f72"
          value={perche}
          onChangeText={setPerche}
          multiline
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLbl}>QUANTO SPENDEVI AL GIORNO IN MEDIA</Text>
        <Text style={styles.cardDesc}>Serve per calcolare i soldi che stai risparmiando.</Text>
        <TextInput
          style={styles.input}
          placeholder="Es. 30"
          placeholderTextColor="#5a5f72"
          value={spesa}
          onChangeText={setSpesa}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>🔒  I tuoi dati restano solo sul tuo telefono.</Text>
      </View>
      <TouchableOpacity
        style={[styles.btn, (!perche || !spesa) && styles.btnDisabled]}
        onPress={inizia}
      >
        <Text style={styles.btnText}>Inizia il percorso →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  hero: { padding: 40, paddingTop: 80, alignItems: 'center' },
  heroEmoji: { fontSize: 48, marginBottom: 16 },
  heroTitolo: { fontSize: 36, fontWeight: '700', color: '#ddd8cf', fontStyle: 'italic', marginBottom: 12 },
  heroSub: { fontSize: 15, color: '#5a5f72', textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 18 },
  cardLbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 6 },
  cardDesc: { fontSize: 12, color: '#5a5f72', lineHeight: 18, marginBottom: 12 },
  input: { backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, padding: 14, color: '#ddd8cf', fontSize: 14, minHeight: 48 },
  noteCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(201,150,90,0.05)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.12)', borderRadius: 16, padding: 14 },
  noteText: { fontSize: 12, color: '#5a5f72', textAlign: 'center' },
  btn: { marginHorizontal: 20, marginBottom: 60, backgroundColor: '#c9965a', borderRadius: 16, padding: 18, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#1a0f00', fontSize: 16, fontWeight: '700' },
});