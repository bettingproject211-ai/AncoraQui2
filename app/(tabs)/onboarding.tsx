import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  const inizia = async () => {
    if (!perche || !spesa || !accettato) return;
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
          <TouchableOpacity style={styles.nextBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(step + 1); }}>
            <Text style={styles.nextBtnText}>{step === 2 ? 'Iniziamo →' : 'Continua →'}</Text>
          </TouchableOpacity>
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(step - 1)}>
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
            >
              <Text style={styles.tipoEmoji}>{t.emoji}</Text>
              <Text style={[styles.tipoLabel, tipoGioco === t.value && styles.tipoLabelOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.introBottom}>
          <TouchableOpacity style={styles.nextBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(4); }}>
            <Text style={styles.nextBtnText}>Continua →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setTipoGioco('altro'); setStep(4); }}>
            <Text style={styles.backText}>Preferisco non dirlo →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.formHeader}>
          <Text style={styles.formTitolo}>Configuriamo insieme.</Text>
          <Text style={styles.formSub}>Tutto rimane solo sul tuo telefono.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>IL TUO NOME — opzionale</Text>
          <Text style={styles.cardDesc}>Appare solo sull'avatar. Nessuno lo vede.</Text>
          <TextInput style={styles.input} placeholder="Es. Marco, Soufiane..." placeholderTextColor="#5a5f72" value={nome} onChangeText={setNome} returnKeyType="next" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>IL TUO PERCHÉ</Text>
          <Text style={styles.cardDesc}>Cosa ti ha fatto aprire questa app oggi?</Text>
          <TextInput style={styles.input} placeholder="Es. per mia figlia, per me stesso..." placeholderTextColor="#5a5f72" value={perche} onChangeText={setPerche} multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>QUANTO SPENDEVI AL GIORNO IN MEDIA</Text>
          <Text style={styles.cardDesc}>Serve per mostrarti i soldi che stai risparmiando.</Text>
          <TextInput style={styles.input} placeholder="Es. 30" placeholderTextColor="#5a5f72" value={spesa} onChangeText={setSpesa} keyboardType="numeric" returnKeyType="next" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>PERSONA DI FIDUCIA — opzionale</Text>
          <Text style={styles.cardDesc}>Chi vuoi poter chiamare nei momenti difficili?</Text>
          <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Nome (es. Marco, Mamma...)" placeholderTextColor="#5a5f72" value={contattoNome} onChangeText={setContattoNome} returnKeyType="next" />
          <TextInput style={styles.input} placeholder="Numero di telefono" placeholderTextColor="#5a5f72" value={contattoNumero} onChangeText={setContattoNumero} keyboardType="phone-pad" />
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitolo}>⚠️ Informazione importante</Text>
          <Text style={styles.disclaimerTesto}>
            Ancora Qui è uno strumento di supporto e non sostituisce il parere di un professionista della salute mentale.{'\n\n'}
            Se sei in crisi chiama il SerD al numero gratuito 800 274 274.
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://bettingproject211-ai.github.io/ancoraqui-legal/privacy-policy.html')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://bettingproject211-ai.github.io/ancoraqui-legal/termini.html')}>
              <Text style={styles.legalLink}>Termini di Utilizzo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.checkRow} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAccettato(!accettato); }}>
            <View style={[styles.checkbox, accettato && styles.checkboxOn]}>
              {accettato && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>Ho letto e accetto Privacy Policy e Termini</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.btn, (!perche || !spesa || !accettato) && styles.btnDisabled]} onPress={inizia}>
          <Text style={styles.btnText}>Inizia →</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  intro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, paddingTop: 80 },
  introEmoji: { fontSize: 56, marginBottom: 28 },
  introTitolo: { fontSize: 22, fontWeight: '700', color: '#ddd8cf', textAlign: 'center', lineHeight: 30, marginBottom: 16, fontFamily: 'Lora_700Bold' },
  introTesto: { fontSize: 15, color: '#5a5f72', textAlign: 'center', lineHeight: 24 },
  istruzioniCard: { marginTop: 28, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 18, width: '100%' },
  istruzioniLbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 8 },
  istruzioniTesto: { fontSize: 13, color: '#5a5f72', lineHeight: 22 },
  introBottom: { padding: 32, alignItems: 'center', gap: 16 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1e2336' },
  dotOn: { backgroundColor: '#c9965a', width: 20 },
  nextBtn: { backgroundColor: '#c9965a', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  nextBtnText: { color: '#1a0f00', fontSize: 16, fontWeight: '700' },
  backText: { fontSize: 13, color: '#5a5f72' },
  tipiContainer: { paddingHorizontal: 20, gap: 10 },
  tipoCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 16, padding: 16 },
  tipoCardOn: { borderColor: 'rgba(201,150,90,0.5)', backgroundColor: 'rgba(201,150,90,0.07)' },
  tipoEmoji: { fontSize: 24 },
  tipoLabel: { fontSize: 14, color: '#5a5f72', fontWeight: '500' },
  tipoLabelOn: { color: '#c9965a' },
  formHeader: { padding: 28, paddingTop: 60, alignItems: 'center' },
  formTitolo: { fontSize: 24, fontWeight: '700', color: '#ddd8cf', marginBottom: 6, fontFamily: 'Lora_700Bold' },
  formSub: { fontSize: 13, color: '#5a5f72' },
  card: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 18 },
  cardLbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 6 },
  cardDesc: { fontSize: 12, color: '#5a5f72', lineHeight: 18, marginBottom: 12 },
  input: { backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, padding: 14, color: '#ddd8cf', fontSize: 14, minHeight: 48 },
  disclaimerCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(184,92,92,0.05)', borderWidth: 1, borderColor: 'rgba(184,92,92,0.2)', borderRadius: 20, padding: 18 },
  disclaimerTitolo: { fontSize: 14, fontWeight: '700', color: '#ddd8cf', marginBottom: 10 },
  disclaimerTesto: { fontSize: 12, color: '#5a5f72', lineHeight: 20, marginBottom: 14 },
  legalLinks: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  legalLink: { fontSize: 12, color: '#c9965a', textDecorationLine: 'underline' },
  legalSep: { fontSize: 12, color: '#5a5f72' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: '#5a5f72', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#c9965a', borderColor: '#c9965a' },
  checkmark: { fontSize: 14, color: '#1a0f00', fontWeight: '700' },
  checkLabel: { fontSize: 13, color: '#ddd8cf', flex: 1 },
  btn: { marginHorizontal: 20, marginBottom: 60, backgroundColor: '#c9965a', borderRadius: 16, padding: 18, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#1a0f00', fontSize: 16, fontWeight: '700' },
});