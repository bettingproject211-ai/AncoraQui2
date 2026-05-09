import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BADGES = [
  { giorni: 1, emoji: '🌱', titolo: 'Primo giorno' },
  { giorni: 3, emoji: '🔥', titolo: 'Tre giorni' },
  { giorni: 7, emoji: '⭐', titolo: 'Una settimana' },
  { giorni: 14, emoji: '🌙', titolo: 'Due settimane' },
  { giorni: 30, emoji: '🏆', titolo: 'Un mese' },
  { giorni: 60, emoji: '💎', titolo: 'Due mesi' },
  { giorni: 100, emoji: '🚀', titolo: '100 giorni' },
];

export default function ProfiloScreen() {
  const [giorni, setGiorni] = useState(0);
  const [risparmi, setRisparmi] = useState(0);
  const [perche, setPerche] = useState('');
  const [nome, setNome] = useState('');
  const [impulsiTotali, setImpulsiTotali] = useState(0);
  const [resistitiTotali, setResistitiTotali] = useState(0);
  const [editNome, setEditNome] = useState(false);
  const [nomeTemp, setNomeTemp] = useState('');

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = async () => {
    try {
      const dataInizio = await AsyncStorageLib.getItem('dataInizio');
      const spesa = await AsyncStorageLib.getItem('spesaGiornaliera');
      const percheStr = await AsyncStorageLib.getItem('perche');
      const nomeStr = await AsyncStorageLib.getItem('nomeUtente');
      const impulsiStr = await AsyncStorageLib.getItem('impulsi');
      if (dataInizio) {
        const inizio = new Date(dataInizio);
        const oggi = new Date();
        const diff = Math.floor((oggi.getTime() - inizio.getTime()) / (1000 * 60 * 60 * 24));
        setGiorni(diff);
        const spesaNum = spesa ? parseFloat(spesa) : 30;
        setRisparmi(diff * spesaNum);
      }
      setPerche(percheStr || '');
      setNome(nomeStr || '');
      if (impulsiStr) {
        const impulsi = JSON.parse(impulsiStr);
        setImpulsiTotali(impulsi.length);
        setResistitiTotali(impulsi.filter((i: any) => i.resistito).length);
      }
    } catch (e) {}
  };

  const salvaNome = async () => {
    await AsyncStorageLib.setItem('nomeUtente', nomeTemp);
    setNome(nomeTemp);
    setEditNome(false);
  };

  const resetApp = () => {
    Alert.alert(
      'Reset app',
      'Vuoi resettare tutti i dati? Utile per testare.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorageLib.clear();
            router.replace('/(tabs)/onboarding' as any);
          }
        }
      ]
    );
  };

  const badgeRaggunti = BADGES.filter(b => b.giorni <= giorni);
  const badgeMancanti = BADGES.filter(b => b.giorni > giorni);

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <View style={styles.avatarGrande}>
          <Text style={styles.avatarEmoji}>
            {giorni >= 100 ? '🚀' : giorni >= 60 ? '💎' : giorni >= 30 ? '🏆' : giorni >= 7 ? '⭐' : '🌱'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => { setNomeTemp(nome); setEditNome(true); }}>
          <Text style={styles.nomeUtente}>{nome || 'Tocca per aggiungere il tuo nome'}</Text>
        </TouchableOpacity>
        <Text style={styles.giorni}>{giorni} giorni libero</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{giorni}</Text>
          <Text style={styles.statLbl}>Giorni</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#c9965a' }]}>€{risparmi.toFixed(0)}</Text>
          <Text style={styles.statLbl}>Risparmiati</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#6aaa82' }]}>
            {impulsiTotali > 0 ? Math.round((resistitiTotali / impulsiTotali) * 100) : 0}%
          </Text>
          <Text style={styles.statLbl}>Resistenza</Text>
        </View>
      </View>

      <View style={styles.percheCard}>
        <Text style={styles.cardLbl}>IL TUO PERCHÉ</Text>
        <Text style={styles.percheText}>"{perche}"</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLbl}>BADGE RAGGIUNTI — {badgeRaggunti.length}/{BADGES.length}</Text>
        {badgeRaggunti.length === 0 ? (
          <Text style={styles.badgeEmpty}>Il tuo primo badge arriva domani 🌱</Text>
        ) : (
          <View style={styles.badgeGrid}>
            {badgeRaggunti.map(b => (
              <View key={b.giorni} style={styles.badgeItem}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                <Text style={styles.badgeTitolo}>{b.titolo}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {badgeMancanti.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLbl}>PROSSIMI BADGE</Text>
          <View style={styles.badgeGrid}>
            {badgeMancanti.map(b => (
              <View key={b.giorni} style={[styles.badgeItem, styles.badgeItemLocked]}>
                <Text style={[styles.badgeEmoji, { opacity: 0.3 }]}>{b.emoji}</Text>
                <Text style={[styles.badgeTitolo, { color: '#5a5f72' }]}>{b.giorni}gg</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* LEGALE */}
      <View style={styles.legalCard}>
        <Text style={styles.cardLbl}>INFORMAZIONI LEGALI</Text>
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL('https://bettingproject211-ai.github.io/ancoraqui-legal/privacy-policy.html')}
        >
          <Text style={styles.legalText}>Privacy Policy</Text>
          <Text style={styles.legalArrow}>→</Text>
        </TouchableOpacity>
        <View style={styles.legalDivider} />
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL('https://bettingproject211-ai.github.io/ancoraqui-legal/termini.html')}
        >
          <Text style={styles.legalText}>Termini di Utilizzo</Text>
          <Text style={styles.legalArrow}>→</Text>
        </TouchableOpacity>
        <View style={styles.legalDivider} />
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL('tel:800274274')}
        >
          <Text style={styles.legalText}>SerD — 800 274 274</Text>
          <Text style={styles.legalArrow}>📞</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Ancora Qui v1.0.0</Text>

      <TouchableOpacity style={styles.resetBtn} onPress={resetApp}>
        <Text style={styles.resetText}>🔄 Reset per test</Text>
      </TouchableOpacity>

      <Modal visible={editNome} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitolo}>Come ti chiami?</Text>
            <Text style={styles.modalDesc}>Rimane solo sul tuo telefono.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Il tuo nome..."
              placeholderTextColor="#5a5f72"
              value={nomeTemp}
              onChangeText={setNomeTemp}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditNome(false)}>
                <Text style={styles.modalCancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={salvaNome}>
                <Text style={styles.modalSaveText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#181c2a' },
  avatarGrande: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(201,150,90,0.1)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarEmoji: { fontSize: 36 },
  nomeUtente: { fontSize: 18, fontWeight: '700', color: '#ddd8cf', marginBottom: 6 },
  giorni: { fontSize: 13, color: '#5a5f72' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, marginBottom: 0, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700', color: '#6aaa82', marginBottom: 4 },
  statLbl: { fontSize: 10, color: '#5a5f72' },
  statDivider: { width: 1, backgroundColor: '#181c2a', marginVertical: 4 },
  percheCard: { marginHorizontal: 20, marginTop: 14, backgroundColor: 'rgba(201,150,90,0.05)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.14)', borderRadius: 18, padding: 16 },
  cardLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 2, marginBottom: 8 },
  percheText: { fontSize: 14, fontStyle: 'italic', color: '#ddd8cf', lineHeight: 22 },
  card: { marginHorizontal: 20, marginTop: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 16 },
  badgeEmpty: { fontSize: 13, color: '#5a5f72', textAlign: 'center', paddingVertical: 8 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  badgeItem: { alignItems: 'center', backgroundColor: 'rgba(201,150,90,0.07)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.2)', borderRadius: 12, padding: 10, minWidth: 70 },
  badgeItemLocked: { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: '#181c2a' },
  badgeEmoji: { fontSize: 24, marginBottom: 4 },
  badgeTitolo: { fontSize: 9, color: '#c9965a', textAlign: 'center' },
  legalCard: { marginHorizontal: 20, marginTop: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 16 },
  legalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  legalText: { fontSize: 13, color: '#ddd8cf' },
  legalArrow: { fontSize: 13, color: '#5a5f72' },
  legalDivider: { height: 1, backgroundColor: '#181c2a' },
  version: { textAlign: 'center', fontSize: 11, color: '#5a5f72', marginTop: 20 },
  resetBtn: { marginHorizontal: 20, marginTop: 8, marginBottom: 40, padding: 14, alignItems: 'center' },
  resetText: { fontSize: 12, color: '#5a5f72' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0c0f1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitolo: { fontSize: 18, fontWeight: '700', color: '#ddd8cf', marginBottom: 6, textAlign: 'center' },
  modalDesc: { fontSize: 13, color: '#5a5f72', textAlign: 'center', marginBottom: 16 },
  modalInput: { backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, padding: 14, color: '#ddd8cf', fontSize: 16, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#111525', alignItems: 'center' },
  modalCancelText: { fontSize: 14, color: '#5a5f72' },
  modalSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#c9965a', alignItems: 'center' },
  modalSaveText: { fontSize: 14, color: '#1a0f00', fontWeight: '700' },
});