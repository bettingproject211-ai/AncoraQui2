import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RicadutaScreen() {
  const [giorni, setGiorni] = useState(0);
  const [risparmi, setRisparmi] = useState(0);
  const [triggerSelezionato, setTriggerSelezionato] = useState('');

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
        setRisparmi(diff * spesaNum);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const triggers = [
    { emoji: '😴', label: 'Ero stanco dopo una lunga giornata' },
    { emoji: '😔', label: 'Ero solo' },
    { emoji: '😤', label: 'Noia o nervosismo' },
    { emoji: '💬', label: 'Altro' },
  ];

  return (
    <ScrollView style={styles.container}>

      <View style={styles.top}>
        <Text style={styles.emoji}>🤲</Text>
        <Text style={styles.titolo}>Sei ancora qui.</Text>
        <Text style={styles.sub}>
          Quei <Text style={styles.highlight}>{giorni} giorni</Text> sono dentro di te per sempre. Nessuno te li toglie.
        </Text>
      </View>

      <View style={styles.giorni}>
        <Text style={styles.giorniLbl}>NON È ZERO. MAI.</Text>
        <View style={styles.giorniRow}>
          <Text style={styles.giorniN}>{giorni}</Text>
          <Text style={styles.giorniT}>giorni di forza reale che hai dimostrato a te stesso.</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.giorniNote}>La ricaduta fa parte del percorso — non è la fine del percorso.</Text>
      </View>

      <View style={styles.soldiCard}>
        <Text style={styles.soldiLbl}>QUELLO CHE HAI GIÀ FATTO</Text>
        <View style={styles.soldiRow}>
          <Text style={styles.soldiIcon}>💶</Text>
          <Text style={styles.soldiDesc}>Risparmiati in {giorni} giorni</Text>
          <Text style={styles.soldiVal}>€{risparmi.toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.cosa}>
        <Text style={styles.cosaQ}>Cosa è successo prima? Solo per capire.</Text>
        {triggers.map((t) => (
          <TouchableOpacity
            key={t.label}
            style={[styles.cosaOpt, triggerSelezionato === t.label && styles.cosaOptOn]}
            onPress={() => setTriggerSelezionato(t.label)}
          >
            <Text style={styles.cosaOptText}>{t.emoji}  {t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaMsg}>Quando sei pronto, ricominciamo. Nessuna fretta.</Text>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>▶  Riprendi il percorso</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  top: { padding: 28, paddingTop: 60, alignItems: 'center' },
  emoji: { fontSize: 44, marginBottom: 14 },
  titolo: { fontSize: 26, fontWeight: '700', color: '#ddd8cf', marginBottom: 10, textAlign: 'center' },
  sub: { fontSize: 13, color: '#5a5f72', lineHeight: 22, textAlign: 'center', paddingHorizontal: 10 },
  highlight: { color: '#e0b87a', fontWeight: '500' },
  giorni: { marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(106,170,130,0.05)', borderWidth: 1, borderColor: 'rgba(106,170,130,0.18)', borderRadius: 20, padding: 16 },
  giorniLbl: { fontSize: 9, color: '#6aaa82', letterSpacing: 2, marginBottom: 10 },
  giorniRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 6 },
  giorniN: { fontSize: 42, fontWeight: '700', color: '#6aaa82', lineHeight: 46 },
  giorniT: { fontSize: 13, color: '#5a5f72', lineHeight: 20, flex: 1 },
  divider: { height: 1, backgroundColor: '#181c2a', marginVertical: 10 },
  giorniNote: { fontSize: 12, color: '#5a5f72', fontStyle: 'italic', lineHeight: 18 },
  soldiCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 14 },
  soldiLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 1.5, marginBottom: 10 },
  soldiRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  soldiIcon: { fontSize: 18 },
  soldiDesc: { flex: 1, fontSize: 12, color: '#5a5f72' },
  soldiVal: { fontSize: 16, color: '#c9965a', fontWeight: '700' },
  cosa: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 14 },
  cosaQ: { fontSize: 13, color: '#ddd8cf', fontWeight: '500', marginBottom: 10, lineHeight: 20 },
  cosaOpt: { backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, padding: 10, marginBottom: 6 },
  cosaOptOn: { borderColor: 'rgba(201,150,90,0.35)', backgroundColor: 'rgba(201,150,90,0.07)' },
  cosaOptText: { fontSize: 12, color: '#5a5f72' },
  cta: { marginHorizontal: 20, marginBottom: 40, backgroundColor: 'rgba(201,150,90,0.07)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.16)', borderRadius: 18, padding: 16, alignItems: 'center' },
  ctaMsg: { fontSize: 13, color: '#a8a29a', lineHeight: 20, marginBottom: 12, textAlign: 'center' },
  ctaBtn: { backgroundColor: '#c9965a', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, width: '100%', alignItems: 'center' },
  ctaBtnText: { color: '#1a0f00', fontSize: 13, fontWeight: '700' },
});