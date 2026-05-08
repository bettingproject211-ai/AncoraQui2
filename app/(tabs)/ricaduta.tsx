import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SosScreen() {
  const pulse = useRef(new Animated.Value(1)).current;
  const [perche, setPerche] = useState('');

  useEffect(() => {
    caricaPerche();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const caricaPerche = async () => {
    try {
      const p = await AsyncStorageLib.getItem('perche');
      setPerche(p || '');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.momento}>MOMENTO DIFFICILE</Text>
        <Text style={styles.titolo}>Sei ancora qui.{'\n'}Questo è tutto.</Text>
        <Text style={styles.sub}>Non devi fare niente adesso.{'\n'}Solo restare qui un momento.</Text>
      </View>
      <View style={styles.respiro}>
        <Animated.View style={[styles.ring, { transform: [{ scale: pulse }] }]}>
          <Text style={styles.ringEmoji}>🌬️</Text>
        </Animated.View>
        <Text style={styles.respiroLbl}>RESPIRA CON ME</Text>
        <Text style={styles.respiroSub}>4 secondi dentro · 4 fuori</Text>
      </View>
      <View style={styles.perche}>
        <Text style={styles.percheLbl}>IL TUO PERCHÉ</Text>
        <Text style={styles.percheVal}>"{perche}"</Text>
      </View>
      <View style={styles.presenza}>
        <Text style={styles.presenzaText}>
          <Text style={styles.presenzaBold}>Non devi essere forte adesso.{'\n'}</Text>
          Solo non aprire quell'altra app per i prossimi 10 minuti.
        </Text>
      </View>
      <TouchableOpacity style={styles.serd}>
        <Text style={styles.serdIcon}>📞</Text>
        <View>
          <Text style={styles.serdLbl}>PARLA CON QUALCUNO ORA</Text>
          <Text style={styles.serdNum}>800 274 274 — SerD</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  header: { padding: 28, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#181c2a', backgroundColor: 'rgba(184,92,92,0.07)' },
  momento: { fontSize: 10, color: '#b85c5c', letterSpacing: 2, marginBottom: 10 },
  titolo: { fontSize: 26, fontWeight: '700', color: '#ddd8cf', lineHeight: 32, marginBottom: 10 },
  sub: { fontSize: 13, color: '#5a5f72', lineHeight: 22 },
  respiro: { margin: 20, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 20, alignItems: 'center' },
  ring: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: '#5d8fa8', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  ringEmoji: { fontSize: 28 },
  respiroLbl: { fontSize: 11, color: '#5d8fa8', letterSpacing: 2, marginBottom: 4 },
  respiroSub: { fontSize: 11, color: '#5a5f72' },
  perche: { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(201,150,90,0.07)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.14)', borderRadius: 18, padding: 16, alignItems: 'center' },
  percheLbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 8 },
  percheVal: { fontSize: 16, fontStyle: 'italic', color: '#ddd8cf', textAlign: 'center', lineHeight: 24 },
  presenza: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 16 },
  presenzaText: { fontSize: 13, color: '#5a5f72', lineHeight: 22, textAlign: 'center', fontStyle: 'italic' },
  presenzaBold: { color: '#a8a29a', fontStyle: 'normal', fontWeight: '500' },
  serd: { marginHorizontal: 20, marginBottom: 40, backgroundColor: 'rgba(184,92,92,0.08)', borderWidth: 1, borderColor: 'rgba(184,92,92,0.25)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  serdIcon: { fontSize: 24 },
  serdLbl: { fontSize: 9, color: '#b85c5c', letterSpacing: 1, marginBottom: 4 },
  serdNum: { fontSize: 16, fontWeight: '600', color: '#ddd8cf' },
});