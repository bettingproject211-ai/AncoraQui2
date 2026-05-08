import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SoldiScreen() {
  const [giorni, setGiorni] = useState(0);
  const [risparmi, setRisparmi] = useState(0);
  const [spesaGiornaliera, setSpesaGiornaliera] = useState(30);

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = async () => {
    try {
      const dataInizio = await AsyncStorageLib.getItem('dataInizio');
      const spesa = await AsyncStorageLib.getItem('spesaGiornaliera');
      if (dataInizio) {
        const inizio = new Date(dataInizio);
        const oggi = new Date();
        const diff = Math.floor((oggi.getTime() - inizio.getTime()) / (1000 * 60 * 60 * 24));
        setGiorni(diff);
        const spesaNum = spesa ? parseFloat(spesa) : 30;
        setSpesaGiornaliera(spesaNum);
        setRisparmi(diff * spesaNum);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const obiettivo = 3000;
  const percentuale = Math.min((risparmi / obiettivo) * 100, 100);

  const traduzioni = [
    { icon: '🛒', titolo: 'Spesa alimentare', sub: `${Math.floor(risparmi / 235)} mesi per due`, raggiunto: risparmi >= 235 },
    { icon: '🏠', titolo: 'Affitto', sub: `${Math.floor(risparmi / 400)} mesi coperti`, raggiunto: risparmi >= 400 },
    { icon: '👶', titolo: 'Primo corredino', sub: 'Tutto quello che serve', raggiunto: risparmi >= 500 },
    { icon: '✈️', titolo: 'Vacanza per due', sub: 'Una settimana al mare', raggiunto: risparmi >= 1000 },
  ];

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.lbl}>I TUOI SOLDI REALI</Text>
        <Text style={styles.titolo}>Non sono numeri.</Text>
        <Text style={styles.sub}>€{spesaGiornaliera} al giorno sembrano niente. Eccoli tradotti in vita vera.</Text>
      </View>

      <View style={styles.bigN}>
        <Text style={styles.bigVal}>€{risparmi.toFixed(0)}</Text>
        <Text style={styles.bigSub}>risparmiati in {giorni} giorni</Text>
        <View style={styles.barWrap}>
          <View style={[styles.barFill, { width: `${percentuale}%` }]} />
        </View>
        <View style={styles.barGoals}>
          <Text style={styles.barGoalText}>€0</Text>
          <Text style={styles.barGoalText}>Obiettivo: €{obiettivo} 🏠</Text>
        </View>
      </View>

      <View style={styles.traduzioni}>
        <Text style={styles.trHead}>COSA SIGNIFICANO DAVVERO</Text>
        {traduzioni.map((t) => (
          <View key={t.titolo} style={styles.trItem}>
            <Text style={styles.trIcon}>{t.icon}</Text>
            <View style={styles.trDesc}>
              <Text style={styles.trTitle}>{t.titolo}</Text>
              <Text style={styles.trSub}>{t.sub}</Text>
            </View>
            <Text style={t.raggiunto ? styles.trOk : styles.trNo}>{t.raggiunto ? '✓' : '○'}</Text>
          </View>
        ))}
      </View>

      <View style={styles.notifica}>
        <Text style={styles.notifIcon}>🌙</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.notifT}>Notifica sera intelligente</Text>
          <Text style={styles.notifS}>Hai segnato "stanco" — l'app arriva prima dell'impulso.</Text>
          <Text style={styles.notifTime}>Ogni sera quando serve — mai quando non serve</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  header: { padding: 20, paddingTop: 60, alignItems: 'center' },
  lbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 6 },
  titolo: { fontSize: 22, fontWeight: '700', color: '#ddd8cf', marginBottom: 6 },
  sub: { fontSize: 12, color: '#5a5f72', textAlign: 'center', lineHeight: 18 },
  bigN: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 20, alignItems: 'center' },
  bigVal: { fontSize: 52, fontWeight: '700', color: '#c9965a', lineHeight: 56 },
  bigSub: { fontSize: 12, color: '#5a5f72', marginBottom: 14 },
  barWrap: { width: '100%', height: 4, backgroundColor: '#181c2a', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', backgroundColor: '#c9965a', borderRadius: 2 },
  barGoals: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  barGoalText: { fontSize: 10, color: '#5a5f72' },
  traduzioni: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, overflow: 'hidden' },
  trHead: { padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#181c2a', fontSize: 9, color: '#5a5f72', letterSpacing: 1.5 },
  trItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: '#181c2a' },
  trIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  trDesc: { flex: 1 },
  trTitle: { fontSize: 13, color: '#ddd8cf', fontWeight: '500', marginBottom: 2 },
  trSub: { fontSize: 11, color: '#5a5f72' },
  trOk: { fontSize: 16, color: '#6aaa82' },
  trNo: { fontSize: 16, color: '#5a5f72', opacity: 0.3 },
  notifica: { marginHorizontal: 20, marginBottom: 40, backgroundColor: 'rgba(93,143,168,0.05)', borderWidth: 1, borderColor: 'rgba(93,143,168,0.14)', borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12 },
  notifIcon: { fontSize: 20, marginTop: 2 },
  notifT: { fontSize: 12, color: '#5d8fa8', fontWeight: '600', marginBottom: 4 },
  notifS: { fontSize: 11, color: '#5a5f72', lineHeight: 16, marginBottom: 4 },
  notifTime: { fontSize: 10, color: '#5a5f72', opacity: 0.6 },
});