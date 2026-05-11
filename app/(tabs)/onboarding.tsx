import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TIPI_GIOCO = [
  { emoji: '🎰', label: 'Slot e macchinette', value: 'slot' },
  { emoji: '⚽', label: 'Scommesse sportive', value: 'sport' },
  { emoji: '🃏', label: 'Poker e casino online', value: 'casino' },
  { emoji: '🎟️', label: 'Gratta e vinci', value: 'gratta' },
  { emoji: '🎲', label: 'Altro o più tipi', value: 'altro' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState('');
  const [tipoGioco, setTipoGioco] = useState('');
  const [perche, setPerche] = useState('');
  const [spesa, setSpesa] = useState('');
  const [contattoNome, setContattoNome] = useState('');
  const [contattoNumero, setContattoNumero] = useState('');
  const [accettato, setAccettato] = useState(false);
  const [maggiorenne, setMaggiorenne] = useState(false);

  const inizia = async () => {
    if (!perche || !spesa || !accettato || !maggiorenne) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorageLib.setItem('dataInizio', new Date().toISOString());
    await AsyncStorageLib.setItem('spesaGiornaliera', spesa);
    await AsyncStorageLib.setItem('perche', perche);
    await AsyncStorageLib.setItem('tipoGioco', tipoGioco);
    if (nome) await AsyncStorageLib.setItem('nomeUtente', nome);
    if (contattoNome) await AsyncStorageLib.setItem('contattoNome', contattoNome);
    if (contattoNumero) await AsyncStorageLib.setItem('contattoNumero', contattoNumero);
    router.replace('/');
  };

  const schermate = [
    { emoji: '🤲', titolo: 'Questa app non ti giudica.', testo: 'Non ti dice cosa fare.\nÈ semplicemente qui.' },
    { emoji: '👁️', titolo: 'Sappiamo che smettere non è semplice come sembra.', testo: 'Nessuno lo sa meglio di chi ci è passato.' },
    { emoji: '📱', titolo: 'Una cosa sola.', testo: 'Mettici in homepage.\nNei momenti difficili devi trovarci subito.', istruzioni: true },
  ];

  if (step < 3) {
    const schermata = schermate[step];
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#080b12" />
        <View style={styles.intro}>
          <Text style={styles.introEmoji}>{schermata.emoji}</Text>
          <Text style={styles.introTitolo}>{schermata.titolo}</Text>
          <Text style={styles.introTesto}>{schermata.testo}</Text>
          {schermata.istruzioni && (
            <View style={styles.istruzioniCard}>
              <Text style={styles.istruzioniLbl}>COME FARLO</Text>
              <Text style={styles.istruzioniTesto}>
                Android: tieni premuta l'app → "Aggiungi alla schermata Home"{'\n\n'}
                iPhone: tocca Condividi → "Aggiungi a Home"
              </Text>
            </View>
          )}
        </View>
        <View style={styles.introBottom}>
          <View style={styles.dots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, step === i && styles.dotOn]} />
            ))}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(step + 1); }} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>{step === 2 ? 'Iniziamo →' : 'Continua →'}</Text>
          </TouchableOpacity>
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} activeOpacity={0.7}>
              <Text style={styles.backText}>← Indietro</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#080b12" />
        <View style={styles.intro}>
          <Text style={styles.introEmoji}>🎯</Text>
          <Text style={styles.introTitolo}>Con cosa hai principalmente un rapporto difficile?</Text>
          <Text style={styles.introTesto}>Non ti giudichiamo. Serve solo per capire meglio come aiutarti.</Text>
        </View>
        <View style={styles.tipiContainer}>
          {TIPI_GIOCO.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[styles.tipoCard, tipoGioco === t.value && styles.tipoCardOn]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTipoGioco(t.value); }}
              activeOpacity={0.8}
            >
              <Text style={styles.tipoEmoji}>{t.emoji}</Text>
              <Text style={[styles.tipoLabel, tipoGioco === t.value && styles.tipoLabelOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.introBottom}>
          <TouchableOpacity style={styles.nextBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(4); }} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>Continua →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setTipoGioco('altro'); setStep(4); }} activeOpacity={0.7}>
            <Text style={styles.backText}>Preferisco non dirlo →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#080b12" />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.formHeader}>
          <Text style={styles.formTitolo}>Configuriamo insieme.</Text>
          <Text style={styles.formSub}>Tutto rimane solo sul tuo telefono.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>IL TUO NOME — opzionale</Text>
          <Text style={styles.cardDesc}>Appare solo sull'avatar. Nessuno lo vede.</Text>
          <TextInput style={styles.input} placeholder="Es. Marco, Soufiane..." placeholderTextColor="#4b5563" value={nome} onChangeText={setNome} returnKeyType="next" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>IL TUO PERCHÉ</Text>
          <Text style={styles.cardDesc}>Cosa ti ha fatto aprire questa app oggi?</Text>
          <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} placeholder="Es. per mia figlia, per me stesso..." placeholderTextColor="#4b5563" value={perche} onChangeText={setPerche} multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>QUANTO SPENDEVI AL GIORNO IN MEDIA</Text>
          <Text style={styles.cardDesc}>Serve per mostrarti i soldi che stai risparmiando.</Text>
          <TextInput style={styles.input} placeholder="Es. 30" placeholderTextColor="#4b5563" value={spesa} onChangeText={setSpesa} keyboardType="numeric" returnKeyType="next" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>PERSONA DI FIDUCIA — opzionale</Text>
          <Text style={styles.cardDesc}>Chi vuoi poter chiamare nei momenti difficili?</Text>
          <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Nome (es. Marco, Mamma...)" placeholderTextColor="#4b5563" value={contattoNome} onChangeText={setContattoNome} returnKeyType="next" />
          <TextInput style={styles.input} placeholder="Numero di telefono" placeholderTextColor="#4b5563" value={contattoNumero} onChangeText={setContattoNumero} keyboardType="phone-pad" />
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitolo}>⚠️ Prima di iniziare</Text>
          <Text style={styles.disclaimerTesto}>
            Ancora Qui è uno strumento di supporto emotivo. Non è un servizio medico o psicologico.{'\n\n'}
            In caso di crisi chiama:{'\n'}
            🆘 Emergenza: <Text style={styles.disclaimerBold}>112</Text>{'\n'}
            📞 SerD: <Text style={styles.disclaimerBold}>800 274 274</Text>{'\n'}
            📞 Telefono Amico: <Text style={styles.disclaimerBold}>02 2327 2327</Text>
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://bettingproject211-ai.github.io/ancoraqui-legal/privacy-policy.html')} activeOpacity={0.8}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://bettingproject211-ai.github.io/ancoraqui-legal/termini.html')} activeOpacity={0.8}>
              <Text style={styles.legalLink}>Termini di Utilizzo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.checkRow, { marginBottom: 12 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMaggiorenne(!maggiorenne); }} activeOpacity={0.8}>
            <View style={[styles.checkbox, maggiorenne && styles.checkboxOn]}>
              {maggiorenne && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>Dichiaro di avere almeno <Text style={{ color: '#d4a853', fontWeight: '700' }}>18 anni</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkRow} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAccettato(!accettato); }} activeOpacity={0.8}>
            <View style={[styles.checkbox, accettato && styles.checkboxOn]}>
              {accettato && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>Ho letto e accetto Privacy Policy e Termini di Utilizzo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, (!perche || !spesa || !accettato || !maggiorenne) && styles.btnDisabled]}
          onPress={inizia} activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Inizia il mio percorso →</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080b12' },
  intro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, paddingTop: 80 },
  introEmoji: { fontSize: 60, marginBottom: 28 },
  introTitolo: { fontSize: 22, fontWeight: '700', color: '#f9fafb', textAlign: 'center', lineHeight: 32, marginBottom: 16, fontFamily: 'Lora_700Bold' },
  introTesto: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 26 },
  istruzioniCard: { marginTop: 28, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 18, width: '100%' },
  istruzioniLbl: { fontSize: 9, color: '#d4a853', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  istruzioniTesto: { fontSize: 13, color: '#6b7280', lineHeight: 22 },
  introBottom: { padding: 32, alignItems: 'center', gap: 16 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a2030' },
  dotOn: { backgroundColor: '#d4a853', width: 20 },
  nextBtn: { backgroundColor: '#d4a853', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  nextBtnText: { color: '#080b12', fontSize: 16, fontWeight: '700' },
  backText: { fontSize: 13, color: '#4b5563' },
  tipiContainer: { paddingHorizontal: 20, gap: 10 },
  tipoCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 16, padding: 16 },
  tipoCardOn: { borderColor: 'rgba(212,168,83,0.4)', backgroundColor: 'rgba(212,168,83,0.07)' },
  tipoEmoji: { fontSize: 24 },
  tipoLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  tipoLabelOn: { color: '#d4a853' },
  formHeader: { padding: 28, paddingTop: 60, alignItems: 'center' },
  formTitolo: { fontSize: 24, fontWeight: '700', color: '#f9fafb', marginBottom: 6, fontFamily: 'Lora_700Bold' },
  formSub: { fontSize: 13, color: '#6b7280' },
  card: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 20, padding: 18 },
  cardLbl: { fontSize: 9, color: '#d4a853', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  cardDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 12 },
  input: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 14, minHeight: 48 },
  disclaimerCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(239,68,68,0.04)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)', borderRadius: 20, padding: 18 },
  disclaimerTitolo: { fontSize: 14, fontWeight: '700', color: '#f9fafb', marginBottom: 10 },
  disclaimerTesto: { fontSize: 12, color: '#6b7280', lineHeight: 22, marginBottom: 16 },
  disclaimerBold: { color: '#f9fafb', fontWeight: '700' },
  legalLinks: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  legalLink: { fontSize: 12, color: '#d4a853', textDecorationLine: 'underline' },
  legalSep: { fontSize: 12, color: '#4b5563' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: '#374151', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: '#d4a853', borderColor: '#d4a853' },
  checkmark: { fontSize: 14, color: '#080b12', fontWeight: '700' },
  checkLabel: { fontSize: 13, color: '#f9fafb', flex: 1, lineHeight: 20 },
  btn: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#d4a853', borderRadius: 16, padding: 18, alignItems: 'center' },
  btnDisabled: { opacity: 0.35 },
  btnText: { color: '#080b12', fontSize: 16, fontWeight: '700' },
});