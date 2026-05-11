import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BADGES = [
  { giorni: 1, emoji: '🌱', titolo: 'Primo giorno' },
  { giorni: 3, emoji: '🔥', titolo: 'Tre giorni' },
  { giorni: 7, emoji: '⭐', titolo: 'Una settimana' },
  { giorni: 14, emoji: '🌙', titolo: 'Due settimane' },
  { giorni: 21, emoji: '💫', titolo: 'Tre settimane' },
  { giorni: 30, emoji: '🏆', titolo: 'Un mese' },
  { giorni: 60, emoji: '💎', titolo: 'Due mesi' },
  { giorni: 100, emoji: '🚀', titolo: '100 giorni' },
];

const LO_SAPEVI = [
  { emoji: '🧠', testo: 'Il cervello del giocatore reagisce al gioco esattamente come a una sostanza. Non è debolezza — è chimica.' },
  { emoji: '🎰', testo: 'Le slot sono progettate per darti quasi-vincite. Il tuo cervello le percepisce come vittorie vere. Non sei tu il problema.' },
  { emoji: '⏱️', testo: 'Bastano 90 secondi per superare un impulso. Se aspetti, passa. Il tuo cervello ti sta solo mentendo per un momento.' },
  { emoji: '💪', testo: 'Ogni volta che resisti a un impulso, il tuo cervello si riconfigura. Stai letteralmente cambiando la tua biologia.' },
  { emoji: '😴', testo: 'La stanchezza e la solitudine sono i trigger più comuni. Non sei debole — sei umano.' },
  { emoji: '📊', testo: 'Il 95% delle persone che smettono ci ricade almeno una volta. La ricaduta non è fallimento — è parte del percorso.' },
  { emoji: '🌱', testo: 'Ci vogliono circa 21 giorni per iniziare a cambiare un\'abitudine. Il tuo cervello sta lavorando anche quando non lo senti.' },
];

const getAvatarEmoji = (giorni: number) => {
  if (giorni >= 100) return '🚀';
  if (giorni >= 60) return '💎';
  if (giorni >= 30) return '🏆';
  if (giorni >= 21) return '💫';
  if (giorni >= 14) return '🌙';
  if (giorni >= 7) return '⭐';
  if (giorni >= 3) return '🔥';
  return '🌱';
};

export default function ProfiloScreen() {
  const [giorni, setGiorni] = useState(0);
  const [risparmi, setRisparmi] = useState(0);
  const [perche, setPerche] = useState('');
  const [nome, setNome] = useState('');
  const [impulsiTotali, setImpulsiTotali] = useState(0);
  const [resistitiTotali, setResistitiTotali] = useState(0);
  const [editNome, setEditNome] = useState(false);
  const [nomeTemp, setNomeTemp] = useState('');
  const [sapeviFatto, setSapeviFatto] = useState(0);
  const [recordGiorni, setRecordGiorni] = useState(0);

  useFocusEffect(useCallback(() => { caricaDati(); }, []));

  const caricaDati = async () => {
    try {
      const dataInizio = await AsyncStorageLib.getItem('dataInizio');
      const spesa = await AsyncStorageLib.getItem('spesaGiornaliera');
      const percheStr = await AsyncStorageLib.getItem('perche');
      const nomeStr = await AsyncStorageLib.getItem('nomeUtente');
      const impulsiStr = await AsyncStorageLib.getItem('impulsi');
      const ultimaRicadutaStr = await AsyncStorageLib.getItem('ultimaRicadutaGiorni');

      if (dataInizio) {
        const inizio = new Date(dataInizio);
        const oggi = new Date();
        const diff = Math.floor((oggi.getTime() - inizio.getTime()) / (1000 * 60 * 60 * 24));
        setGiorni(diff);
        const spesaNum = spesa ? parseFloat(spesa) : 30;
        setRisparmi(diff * spesaNum);
        // Record = massimo tra giorni attuali e ultima ricaduta
        const ultimaRicaduta = ultimaRicadutaStr ? parseInt(ultimaRicadutaStr) : 0;
        setRecordGiorni(Math.max(diff, ultimaRicaduta));
      }
      setPerche(percheStr || '');
      setNome(nomeStr || '');
      if (impulsiStr) {
        const impulsi = JSON.parse(impulsiStr);
        setImpulsiTotali(impulsi.length);
        setResistitiTotali(impulsi.filter((i: any) => i.resistito).length);
      }
      const giornoAnno = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      setSapeviFatto(giornoAnno % LO_SAPEVI.length);
    } catch (e) {}
  };

  const salvaNome = async () => {
    await AsyncStorageLib.setItem('nomeUtente', nomeTemp);
    setNome(nomeTemp);
    setEditNome(false);
  };

  const resetApp = () => {
    Alert.alert('Reset app', 'Vuoi resettare tutti i dati?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => { await AsyncStorageLib.clear(); router.replace('/(tabs)/onboarding' as any); }
      }
    ]);
  };

  const badgeRaggunti = BADGES.filter(b => b.giorni <= giorni);
  const badgeMancanti = BADGES.filter(b => b.giorni > giorni);
  const fatto = LO_SAPEVI[sapeviFatto];
  const resistenzaPerc = impulsiTotali > 0 ? Math.round((resistitiTotali / impulsiTotali) * 100) : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <StatusBar barStyle="light-content" backgroundColor="#080b12" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.logoSub}>il tuo profilo</Text>
            <Text style={styles.logo}>Ancora Qui</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.avatarWrapper} onPress={() => { setNomeTemp(nome); setEditNome(true); }} activeOpacity={0.8}>
          <View style={styles.avatarGrande}>
            <Text style={styles.avatarEmoji}>{getAvatarEmoji(giorni)}</Text>
          </View>
          <Text style={styles.nomeUtente}>{nome || 'Tocca per aggiungere il nome'}</Text>
          <Text style={styles.giorniSub}>{giorni} giorni libero</Text>
        </TouchableOpacity>
      </View>

      {/* STATISTICHE — 3 numeri grandi */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#10b981' }]}>{giorni}</Text>
          <Text style={styles.statLbl}>Giorni</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#d4a853' }]}>€{risparmi.toFixed(0)}</Text>
          <Text style={styles.statLbl}>Risparmiati</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#3b82f6' }]}>{resistenzaPerc}%</Text>
          <Text style={styles.statLbl}>Resistenza</Text>
        </View>
      </View>

      {/* RECORD */}
      {recordGiorni > 0 && (
        <View style={styles.recordCard}>
          <Text style={styles.recordLbl}>IL TUO RECORD PERSONALE</Text>
          <View style={styles.recordRow}>
            <Text style={styles.recordNum}>{recordGiorni}</Text>
            <View>
              <Text style={styles.recordGiorni}>giorni</Text>
              <Text style={styles.recordSub}>Nessuno te li toglie. Mai.</Text>
            </View>
          </View>
        </View>
      )}

      {/* PERCHÉ */}
      <View style={styles.percheCard}>
        <Text style={styles.cardLbl}>IL TUO PERCHÉ</Text>
        <Text style={styles.percheText}>"{perche}"</Text>
      </View>

      {/* LO SAPEVI */}
      <View style={styles.sapevCard}>
        <Text style={styles.cardLbl}>LO SAPEVI? 💡</Text>
        <Text style={styles.sapevEmoji}>{fatto?.emoji}</Text>
        <Text style={styles.sapevTesto}>{fatto?.testo}</Text>
      </View>

      {/* BADGE RAGGIUNTI */}
      <View style={styles.card}>
        <Text style={styles.cardLbl}>BADGE RAGGIUNTI — {badgeRaggunti.length}/{BADGES.length}</Text>
        {badgeRaggunti.length === 0 ? (
          <Text style={styles.badgeEmpty}>Il tuo primo badge arriva al giorno 1 🌱</Text>
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

      {/* BADGE MANCANTI */}
      {badgeMancanti.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLbl}>PROSSIMI TRAGUARDI</Text>
          <View style={styles.badgeGrid}>
            {badgeMancanti.map(b => (
              <View key={b.giorni} style={styles.badgeItemLocked}>
                <Text style={[styles.badgeEmoji, { opacity: 0.25 }]}>{b.emoji}</Text>
                <Text style={styles.badgeLockedGiorni}>{b.giorni}gg</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* NUMERI UTILI */}
      <View style={styles.emergenzaCard}>
        <Text style={styles.cardLbl}>NUMERI UTILI</Text>
        <TouchableOpacity style={styles.contattoRow} onPress={() => Linking.openURL('tel:112')} activeOpacity={0.8}>
          <View style={styles.contattoIcon}><Text style={styles.contattoIconText}>🆘</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contattoNome}>Emergenza</Text>
            <Text style={styles.contattoSub}>Numero unico di emergenza</Text>
          </View>
          <Text style={styles.contattoNum}>112</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.contattoRow} onPress={() => Linking.openURL('tel:800274274')} activeOpacity={0.8}>
          <View style={styles.contattoIcon}><Text style={styles.contattoIconText}>📞</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contattoNome}>SerD</Text>
            <Text style={styles.contattoSub}>Servizio Dipendenze — gratuito</Text>
          </View>
          <Text style={styles.contattoNum}>800 274 274</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.contattoRow} onPress={() => Linking.openURL('tel:0223272327')} activeOpacity={0.8}>
          <View style={styles.contattoIcon}><Text style={styles.contattoIconText}>💙</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contattoNome}>Telefono Amico</Text>
            <Text style={styles.contattoSub}>Supporto emotivo</Text>
          </View>
          <Text style={styles.contattoNum}>02 2327 2327</Text>
        </TouchableOpacity>
      </View>

      {/* LEGALE */}
      <View style={styles.card}>
        <Text style={styles.cardLbl}>INFORMAZIONI LEGALI</Text>
        <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL('https://bettingproject211-ai.github.io/ancoraqui-legal/privacy-policy.html')} activeOpacity={0.8}>
          <Text style={styles.legalText}>Privacy Policy</Text>
          <Text style={styles.legalArrow}>→</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL('https://bettingproject211-ai.github.io/ancoraqui-legal/termini.html')} activeOpacity={0.8}>
          <Text style={styles.legalText}>Termini di Utilizzo</Text>
          <Text style={styles.legalArrow}>→</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL('mailto:ancoraqui.app@gmail.com')} activeOpacity={0.8}>
          <Text style={styles.legalText}>Contattaci</Text>
          <Text style={styles.legalArrow}>✉️</Text>
        </TouchableOpacity>
      </View>

      {/* DISCLAIMER */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          Ancora Qui è uno strumento di supporto emotivo. Non è un servizio medico o psicologico e non sostituisce un professionista della salute mentale.
        </Text>
      </View>

      <Text style={styles.version}>Ancora Qui v1.0.1 · Per utenti 18+</Text>

      {__DEV__ && (
        <TouchableOpacity style={styles.resetBtn} onPress={resetApp} activeOpacity={0.7}>
          <Text style={styles.resetText}>🔄 Reset per test (solo sviluppo)</Text>
        </TouchableOpacity>
      )}

      {/* MODAL NOME */}
      <Modal visible={editNome} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitolo}>Come ti chiami?</Text>
            <Text style={styles.modalDesc}>Rimane solo sul tuo telefono.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Il tuo nome..."
              placeholderTextColor="#4b5563"
              value={nomeTemp}
              onChangeText={setNomeTemp}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditNome(false)} activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={salvaNome} activeOpacity={0.8}>
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
  container: { flex: 1, backgroundColor: '#080b12' },

  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1a2030' },
  headerTop: { marginBottom: 24 },
  logoSub: { fontSize: 10, color: '#4b5563', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 },
  logo: { fontSize: 26, fontWeight: '700', color: '#d4a853', letterSpacing: 1 },
  avatarWrapper: { alignItems: 'center' },
  avatarGrande: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(212,168,83,0.08)', borderWidth: 1.5, borderColor: 'rgba(212,168,83,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarEmoji: { fontSize: 40 },
  nomeUtente: { fontSize: 18, fontWeight: '700', color: '#f9fafb', marginBottom: 4, letterSpacing: 0.3 },
  giorniSub: { fontSize: 13, color: '#4b5563' },

  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 20, padding: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '700', marginBottom: 4, fontFamily: 'Lora_700Bold' },
  statLbl: { fontSize: 10, color: '#4b5563', letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: '#1a2030', marginVertical: 4 },

  recordCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: 'rgba(16,185,129,0.05)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.12)', borderRadius: 18, padding: 16 },
  recordLbl: { fontSize: 9, color: '#10b981', letterSpacing: 2.5, marginBottom: 10, textTransform: 'uppercase' },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordNum: { fontSize: 48, fontWeight: '700', color: '#10b981', fontFamily: 'Lora_700Bold', lineHeight: 52 },
  recordGiorni: { fontSize: 14, color: '#10b981', fontWeight: '600', marginBottom: 2 },
  recordSub: { fontSize: 11, color: '#6b7280', fontStyle: 'italic' },

  percheCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: 'rgba(212,168,83,0.05)', borderWidth: 1, borderColor: 'rgba(212,168,83,0.12)', borderRadius: 18, padding: 16 },
  cardLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2.5, marginBottom: 10, textTransform: 'uppercase' },
  percheText: { fontSize: 15, fontStyle: 'italic', color: '#f9fafb', lineHeight: 24, fontFamily: 'Lora_400Regular_Italic' },

  sapevCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: 'rgba(59,130,246,0.05)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.12)', borderRadius: 18, padding: 16 },
  sapevEmoji: { fontSize: 32, marginBottom: 10 },
  sapevTesto: { fontSize: 14, color: '#e5e7eb', lineHeight: 22 },

  card: { marginHorizontal: 20, marginTop: 12, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 16 },
  badgeEmpty: { fontSize: 13, color: '#4b5563', textAlign: 'center', paddingVertical: 8 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  badgeItem: { alignItems: 'center', backgroundColor: 'rgba(212,168,83,0.06)', borderWidth: 1, borderColor: 'rgba(212,168,83,0.15)', borderRadius: 14, padding: 10, minWidth: 72 },
  badgeItemLocked: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: '#1a2030', borderRadius: 14, padding: 10, minWidth: 72 },
  badgeEmoji: { fontSize: 24, marginBottom: 4 },
  badgeTitolo: { fontSize: 9, color: '#d4a853', textAlign: 'center' },
  badgeLockedGiorni: { fontSize: 9, color: '#374151', textAlign: 'center' },

  emergenzaCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 16 },
  contattoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  contattoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  contattoIconText: { fontSize: 16 },
  contattoNome: { fontSize: 13, fontWeight: '600', color: '#f9fafb', marginBottom: 2 },
  contattoSub: { fontSize: 10, color: '#4b5563' },
  contattoNum: { fontSize: 12, fontWeight: '700', color: '#d4a853' },

  divider: { height: 1, backgroundColor: '#1a2030' },
  legalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  legalText: { fontSize: 13, color: '#9ca3af' },
  legalArrow: { fontSize: 13, color: '#4b5563' },

  disclaimerBox: { marginHorizontal: 20, marginTop: 12, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 14, padding: 14 },
  disclaimerText: { fontSize: 11, color: '#4b5563', lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },
  version: { textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 16, marginBottom: 8 },
  resetBtn: { marginHorizontal: 20, marginTop: 8, padding: 14, alignItems: 'center' },
  resetText: { fontSize: 12, color: '#ef4444' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0d1117', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitolo: { fontSize: 18, fontWeight: '700', color: '#f9fafb', marginBottom: 6, textAlign: 'center', fontFamily: 'Lora_700Bold' },
  modalDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  modalInput: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 16, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center' },
  modalCancelText: { fontSize: 14, color: '#6b7280' },
  modalSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#d4a853', alignItems: 'center' },
  modalSaveText: { fontSize: 14, color: '#080b12', fontWeight: '700' },
});