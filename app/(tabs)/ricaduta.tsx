import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TRIGGER = [
  { emoji: '😔', label: 'Solitudine' },
  { emoji: '😤', label: 'Stress' },
  { emoji: '😴', label: 'Stanchezza' },
  { emoji: '😢', label: 'Tristezza' },
  { emoji: '😠', label: 'Rabbia' },
  { emoji: '🤑', label: 'Soldi facili' },
  { emoji: '🎉', label: 'Euforia' },
  { emoji: '👥', label: 'Pressione sociale' },
  { emoji: '🍺', label: 'Alcol' },
  { emoji: '❓', label: 'Non so' },
];

const getMessaggioIncoraggiamento = (giorni: number): { titolo: string; testo: string } => {
  if (giorni >= 30) return {
    titolo: 'Quella forza è ancora dentro di te.',
    testo: `Hai fatto ${giorni} giorni. Nessuno te li toglie — sono tuoi per sempre.\n\nSai già che ce la fai. Lo hai già dimostrato.`,
  };
  if (giorni >= 14) return {
    titolo: 'Sai già come si fa.',
    testo: `${giorni} giorni li hai già fatti. Hai già la prova che puoi farcela.\n\nOggi si ricomincia con una cosa in più: la conoscenza dei tuoi trigger.`,
  };
  if (giorni >= 4) return {
    titolo: 'Hai già dimostrato qualcosa.',
    testo: `${giorni} giorni sono reali. Sono tuoi.\n\nOggi ricomincia con questa consapevolezza in più.`,
  };
  return {
    titolo: 'Hai fatto il primo passo. Di nuovo.',
    testo: 'E questo conta. Ogni volta che torni qui stai scegliendo qualcosa di diverso.\n\nSei ancora qui. Ed è tutto quello che serve.',
  };
};

export default function RicadutaScreen() {
  const [giorni, setGiorni] = useState(0);
  const [step, setStep] = useState(0);
  const [triggerSelezionati, setTriggerSelezionati] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [messaggioFinale, setMessaggioFinale] = useState<{ titolo: string; testo: string } | null>(null);
  const animaFade = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    caricaDati();
    setStep(0);
    setTriggerSelezionati([]);
    setMessaggioFinale(null);
    animaFade.setValue(0);
    Animated.timing(animaFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []));

  const caricaDati = async () => {
    try {
      const dataInizio = await AsyncStorageLib.getItem('dataInizio');
      if (dataInizio) {
        const inizio = new Date(dataInizio);
        const oggi = new Date();
        const diff = Math.floor((oggi.getTime() - inizio.getTime()) / (1000 * 60 * 60 * 24));
        setGiorni(diff);
      }
    } catch (e) {}
  };

  const toggleTrigger = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTriggerSelezionati(prev =>
      prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]
    );
  };

  const resetPercorso = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Salva ricaduta nel diario
      const impulsiStr = await AsyncStorageLib.getItem('impulsi');
      const impulsi = impulsiStr ? JSON.parse(impulsiStr) : [];
      const nuovo = {
        id: Date.now(),
        trigger: triggerSelezionati.join(', ') || 'Non specificato',
        nota: `Ricaduta dopo ${giorni} giorni`,
        resistito: false,
        ora: new Date().getHours(),
        oraLabel: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        data: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
      };
      await AsyncStorageLib.setItem('impulsi', JSON.stringify([nuovo, ...impulsi]));

      // Reset contatore
      await AsyncStorageLib.setItem('dataInizio', new Date().toISOString());
      await AsyncStorageLib.setItem('ultimoCheckin', '');

      // Messaggio finale personalizzato
      setMessaggioFinale(getMessaggioIncoraggiamento(giorni));
      setConfirmModal(false);
      setStep(3);
    } catch (e) {}
  };

  // STEP 0 — Accoglienza
  if (step === 0) {
    return (
      <Animated.ScrollView style={[styles.container, { opacity: animaFade }]} contentContainerStyle={styles.content}>

        <Text style={styles.emoji}>🤲</Text>
        <Text style={styles.titolo}>È successo.{'\n'}Va bene.</Text>
        <Text style={styles.sub}>Sei ancora qui — e questo è già qualcosa.</Text>

        {giorni > 0 && (
          <View style={styles.giorniCard}>
            <Text style={styles.giorniLbl}>GIORNI CHE RESTANO TUOI</Text>
            <Text style={styles.giorniNum}>{giorni}</Text>
            <Text style={styles.giorniSub}>
              Nessuna ricaduta te li toglie. Mai.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitolo}>Non sei il primo.</Text>
          <Text style={styles.cardTesto}>
            Il 95% delle persone che affrontano una dipendenza ci ricade almeno una volta.{'\n\n'}
            La ricaduta non è un fallimento — è parte del percorso. Lo dicono i dati, non le parole.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnPrimario}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(1); }}
        >
          <Text style={styles.btnPrimarioText}>Voglio ricominciare →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondario} onPress={() => router.replace('/')}>
          <Text style={styles.btnSecondarioText}>← Torna alla home</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    );
  }

  // STEP 1 — Trigger
  if (step === 1) {
    return (
      <Animated.ScrollView style={[styles.container, { opacity: animaFade }]} contentContainerStyle={styles.content}>

        <Text style={styles.emoji}>🔍</Text>
        <Text style={styles.titolo}>Cosa è successo?</Text>
        <Text style={styles.sub}>
          Non per giudicarti. Per capire insieme cosa ha scatenato questo momento — così la prossima volta lo riconosci prima.
        </Text>

        <View style={styles.triggerGrid}>
          {TRIGGER.map(t => (
            <TouchableOpacity
              key={t.label}
              style={[styles.triggerItem, triggerSelezionati.includes(t.label) && styles.triggerItemOn]}
              onPress={() => toggleTrigger(t.label)}
            >
              <Text style={styles.triggerEmoji}>{t.emoji}</Text>
              <Text style={[styles.triggerLabel, triggerSelezionati.includes(t.label) && styles.triggerLabelOn]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.btnPrimario}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(2); }}
        >
          <Text style={styles.btnPrimarioText}>Continua →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondario} onPress={() => setStep(0)}>
          <Text style={styles.btnSecondarioText}>← Indietro</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    );
  }

  // STEP 2 — Conferma reset
  if (step === 2) {
    return (
      <Animated.ScrollView style={[styles.container, { opacity: animaFade }]} contentContainerStyle={styles.content}>

        <Text style={styles.emoji}>💙</Text>
        <Text style={styles.titolo}>Vuoi resettare{'\n'}il contatore?</Text>
        <Text style={styles.sub}>
          Non è obbligatorio. Puoi tornare alla home senza cambiare nulla.
        </Text>

        {giorni >= 7 && (
          <View style={styles.giorniCard}>
            <Text style={styles.giorniLbl}>I TUOI GIORNI</Text>
            <Text style={styles.giorniNum}>{giorni}</Text>
            <Text style={styles.giorniSub}>Restano nel diario. Per sempre.</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitolo}>Se resetti</Text>
          <Text style={styles.cardTesto}>
            Il contatore riparte da oggi.{'\n'}
            I tuoi {giorni} giorni rimangono registrati nel diario.{'\n\n'}
            Puoi anche non resettare — se preferisci tenere il contatore e lavorare su quello che è successo.
          </Text>
        </View>

        {/* TORNA SENZA RESETTARE — bottone principale */}
        <TouchableOpacity
          style={styles.btnPrimario}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/'); }}
        >
          <Text style={styles.btnPrimarioText}>← Torna senza resettare</Text>
        </TouchableOpacity>

        {/* RESET — bottone secondario e meno visibile */}
        <TouchableOpacity
          style={styles.btnReset}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setConfirmModal(true); }}
        >
          <Text style={styles.btnResetText}>Resetta il contatore</Text>
        </TouchableOpacity>

        <Modal visible={confirmModal} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🌱</Text>
              <Text style={styles.modalTitolo}>Sei sicuro?</Text>
              <Text style={styles.modalDesc}>
                Il contatore riparte da oggi.{'\n'}
                I tuoi {giorni} giorni restano nel diario.
              </Text>
              <TouchableOpacity style={styles.modalBtnNo} onPress={() => setConfirmModal(false)}>
                <Text style={styles.modalBtnNoText}>No, aspetto ancora</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSi} onPress={resetPercorso}>
                <Text style={styles.modalBtnSiText}>Sì, ricomincia da oggi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </Animated.ScrollView>
    );
  }

  // STEP 3 — Messaggio finale dopo reset
  return (
    <Animated.ScrollView style={[styles.container, { opacity: animaFade }]} contentContainerStyle={styles.content}>

      <Text style={styles.emoji}>🌅</Text>
      <Text style={styles.titolo}>{messaggioFinale?.titolo}</Text>
      <Text style={styles.sub}>Sei ancora qui.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTesto}>{messaggioFinale?.testo}</Text>
      </View>

      {triggerSelezionati.length > 0 && (
        <View style={styles.triggerRiepilogo}>
          <Text style={styles.triggerRiepilogoLbl}>HAI IDENTIFICATO I TUOI TRIGGER</Text>
          <View style={styles.triggerRiepilogoRow}>
            {triggerSelezionati.map(t => (
              <View key={t} style={styles.triggerTag}>
                <Text style={styles.triggerTagText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.triggerRiepilogoSub}>
            La prossima volta che senti questi stati, apri l'app prima. Siamo qui.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.btnPrimario}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/'); }}
      >
        <Text style={styles.btnPrimarioText}>Torna alla home →</Text>
      </TouchableOpacity>

    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  content: { flexGrow: 1, alignItems: 'center', padding: 28, paddingTop: 80, paddingBottom: 60 },
  emoji: { fontSize: 64, marginBottom: 20 },
  titolo: { fontSize: 26, fontWeight: '700', color: '#ddd8cf', textAlign: 'center', lineHeight: 34, marginBottom: 14, fontFamily: 'Lora_700Bold' },
  sub: { fontSize: 15, color: '#5a5f72', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  giorniCard: { backgroundColor: 'rgba(106,170,130,0.07)', borderWidth: 1, borderColor: 'rgba(106,170,130,0.2)', borderRadius: 20, padding: 20, alignItems: 'center', width: '100%', marginBottom: 16 },
  giorniLbl: { fontSize: 9, color: '#6aaa82', letterSpacing: 2, marginBottom: 8 },
  giorniNum: { fontSize: 56, fontWeight: '700', color: '#6aaa82', fontFamily: 'Lora_700Bold', lineHeight: 60 },
  giorniSub: { fontSize: 12, color: '#6aaa82', marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 20, width: '100%', marginBottom: 24 },
  cardTitolo: { fontSize: 11, color: '#c9965a', letterSpacing: 2, marginBottom: 10 },
  cardTesto: { fontSize: 14, color: '#a8a29a', lineHeight: 24 },
  triggerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 24, width: '100%' },
  triggerItem: { alignItems: 'center', backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 16, padding: 14, minWidth: 80 },
  triggerItemOn: { borderColor: 'rgba(201,150,90,0.5)', backgroundColor: 'rgba(201,150,90,0.07)' },
  triggerEmoji: { fontSize: 28, marginBottom: 6 },
  triggerLabel: { fontSize: 11, color: '#5a5f72', textAlign: 'center' },
  triggerLabelOn: { color: '#c9965a' },
  triggerRiepilogo: { backgroundColor: 'rgba(201,150,90,0.05)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.15)', borderRadius: 18, padding: 16, width: '100%', marginBottom: 20 },
  triggerRiepilogoLbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 12 },
  triggerRiepilogoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  triggerTag: { backgroundColor: 'rgba(201,150,90,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  triggerTagText: { fontSize: 12, color: '#c9965a' },
  triggerRiepilogoSub: { fontSize: 12, color: '#5a5f72', lineHeight: 18 },
  btnPrimario: { backgroundColor: '#c9965a', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 12 },
  btnPrimarioText: { color: '#1a0f00', fontSize: 15, fontWeight: '700' },
  btnSecondario: { padding: 12, marginBottom: 8 },
  btnSecondarioText: { fontSize: 13, color: '#5a5f72' },
  btnReset: { paddingVertical: 12, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 8 },
  btnResetText: { fontSize: 13, color: '#5a5f72', textDecorationLine: 'underline' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
  modalEmoji: { fontSize: 48, marginBottom: 16 },
  modalTitolo: { fontSize: 20, fontWeight: '700', color: '#ddd8cf', marginBottom: 10, textAlign: 'center', fontFamily: 'Lora_700Bold' },
  modalDesc: { fontSize: 14, color: '#5a5f72', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBtnNo: { backgroundColor: '#c9965a', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 10 },
  modalBtnNoText: { color: '#1a0f00', fontSize: 14, fontWeight: '700' },
  modalBtnSi: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  modalBtnSiText: { fontSize: 13, color: '#5a5f72', textDecorationLine: 'underline' },
});