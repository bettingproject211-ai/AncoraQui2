import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const getMessaggio = (giorni: number): { titolo: string; testo: string } => {
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
        const diff = Math.floor((new Date().getTime() - new Date(dataInizio).getTime()) / (1000 * 60 * 60 * 24));
        setGiorni(diff);
      }
    } catch (e) {}
  };

  const toggleTrigger = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTriggerSelezionati(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  };

  const resetPercorso = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await AsyncStorageLib.setItem('ultimaRicadutaGiorni', giorni.toString());
      const impulsiStr = await AsyncStorageLib.getItem('impulsi');
      const impulsi = impulsiStr ? JSON.parse(impulsiStr) : [];
      impulsi.unshift({
        id: Date.now(),
        trigger: triggerSelezionati.join(', ') || 'Non specificato',
        nota: `Ricaduta dopo ${giorni} giorni`,
        resistito: false,
        ora: new Date().getHours(),
        oraLabel: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        data: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
      });
      await AsyncStorageLib.setItem('impulsi', JSON.stringify(impulsi));
      await AsyncStorageLib.setItem('dataInizio', new Date().toISOString());
      await AsyncStorageLib.setItem('ultimoCheckin', '');
      setMessaggioFinale(getMessaggio(giorni));
      setConfirmModal(false);
      setStep(3);
    } catch (e) {}
  };

  if (step === 0) {
    return (
      <Animated.ScrollView style={[styles.container, { opacity: animaFade }]} contentContainerStyle={styles.content}>
        <StatusBar barStyle="light-content" backgroundColor="#080b12" />
        <Text style={styles.emoji}>🤲</Text>
        <Text style={styles.titolo}>È successo.{'\n'}Va bene.</Text>
        <Text style={styles.sub}>Sei ancora qui — e questo è già qualcosa.</Text>
        {giorni > 0 && (
          <View style={styles.giorniCard}>
            <Text style={styles.giorniLbl}>GIORNI CHE RESTANO TUOI</Text>
            <Text style={styles.giorniNum}>{giorni}</Text>
            <Text style={styles.giorniSub}>Nessuna ricaduta te li toglie. Mai.</Text>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.cardTitolo}>Non sei il primo.</Text>
          <Text style={styles.cardTesto}>
            Il 95% delle persone che affrontano una dipendenza ci ricade almeno una volta.{'\n\n'}
            La ricaduta non è un fallimento — è parte del percorso. Lo dicono i dati, non le parole.
          </Text>
        </View>
        <TouchableOpacity style={styles.btnPrimario} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(1); }} activeOpacity={0.8}>
          <Text style={styles.btnPrimarioText}>Voglio ricominciare →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondario} onPress={() => router.replace('/')} activeOpacity={0.7}>
          <Text style={styles.btnSecondarioText}>← Torna alla home</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    );
  }

  if (step === 1) {
    return (
      <Animated.ScrollView style={[styles.container, { opacity: animaFade }]} contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={styles.titolo}>Cosa è successo?</Text>
        <Text style={styles.sub}>Non per giudicarti. Per capire insieme cosa ha scatenato questo momento.</Text>
        <View style={styles.triggerGrid}>
          {TRIGGER.map(t => (
            <TouchableOpacity
              key={t.label}
              style={[styles.triggerItem, triggerSelezionati.includes(t.label) && styles.triggerItemOn]}
              onPress={() => toggleTrigger(t.label)} activeOpacity={0.7}
            >
              <Text style={styles.triggerEmoji}>{t.emoji}</Text>
              <Text style={[styles.triggerLabel, triggerSelezionati.includes(t.label) && styles.triggerLabelOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.btnPrimario} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(2); }} activeOpacity={0.8}>
          <Text style={styles.btnPrimarioText}>Continua →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondario} onPress={() => setStep(0)} activeOpacity={0.7}>
          <Text style={styles.btnSecondarioText}>← Indietro</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    );
  }

  if (step === 2) {
    return (
      <Animated.ScrollView style={[styles.container, { opacity: animaFade }]} contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>💙</Text>
        <Text style={styles.titolo}>Vuoi resettare{'\n'}il contatore?</Text>
        <Text style={styles.sub}>Non è obbligatorio. Puoi tornare alla home senza cambiare nulla.</Text>
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
            Il contatore riparte da oggi.{'\n'}I tuoi {giorni} giorni rimangono nel diario.{'\n\n'}
            Puoi anche non resettare — se preferisci tenere il contatore e lavorare su quello che è successo.
          </Text>
        </View>
        <TouchableOpacity style={styles.btnPrimario} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/'); }} activeOpacity={0.8}>
          <Text style={styles.btnPrimarioText}>← Torna senza resettare</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnReset} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setConfirmModal(true); }} activeOpacity={0.7}>
          <Text style={styles.btnResetText}>Resetta il contatore</Text>
        </TouchableOpacity>
        <Modal visible={confirmModal} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🌱</Text>
              <Text style={styles.modalTitolo}>Sei sicuro?</Text>
              <Text style={styles.modalDesc}>Il contatore riparte da oggi.{'\n'}I tuoi {giorni} giorni restano nel diario.</Text>
              <TouchableOpacity style={styles.modalBtnNo} onPress={() => setConfirmModal(false)} activeOpacity={0.8}>
                <Text style={styles.modalBtnNoText}>No, aspetto ancora</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSi} onPress={resetPercorso} activeOpacity={0.7}>
                <Text style={styles.modalBtnSiText}>Sì, ricomincia da oggi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Animated.ScrollView>
    );
  }

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
          <Text style={styles.triggerRiepilogoSub}>La prossima volta che senti questi stati, apri l'app prima. Siamo qui.</Text>
        </View>
      )}
      <TouchableOpacity style={styles.btnPrimario} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/'); }} activeOpacity={0.8}>
        <Text style={styles.btnPrimarioText}>Torna alla home →</Text>
      </TouchableOpacity>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080b12' },
  content: { flexGrow: 1, alignItems: 'center', padding: 28, paddingTop: 80, paddingBottom: 60 },
  emoji: { fontSize: 64, marginBottom: 20 },
  titolo: { fontSize: 26, fontWeight: '700', color: '#f9fafb', textAlign: 'center', lineHeight: 34, marginBottom: 14, fontFamily: 'Lora_700Bold' },
  sub: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  giorniCard: { backgroundColor: 'rgba(16,185,129,0.06)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)', borderRadius: 20, padding: 20, alignItems: 'center', width: '100%', marginBottom: 16 },
  giorniLbl: { fontSize: 9, color: '#10b981', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  giorniNum: { fontSize: 56, fontWeight: '700', color: '#10b981', fontFamily: 'Lora_700Bold', lineHeight: 60 },
  giorniSub: { fontSize: 12, color: '#10b981', marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 20, padding: 20, width: '100%', marginBottom: 24 },
  cardTitolo: { fontSize: 11, color: '#d4a853', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  cardTesto: { fontSize: 14, color: '#9ca3af', lineHeight: 24 },
  triggerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 24, width: '100%' },
  triggerItem: { alignItems: 'center', backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 16, padding: 14, minWidth: 80 },
  triggerItemOn: { borderColor: 'rgba(212,168,83,0.4)', backgroundColor: 'rgba(212,168,83,0.07)' },
  triggerEmoji: { fontSize: 28, marginBottom: 6 },
  triggerLabel: { fontSize: 11, color: '#4b5563', textAlign: 'center' },
  triggerLabelOn: { color: '#d4a853' },
  triggerRiepilogo: { backgroundColor: 'rgba(212,168,83,0.05)', borderWidth: 1, borderColor: 'rgba(212,168,83,0.12)', borderRadius: 18, padding: 16, width: '100%', marginBottom: 20 },
  triggerRiepilogoLbl: { fontSize: 9, color: '#d4a853', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  triggerRiepilogoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  triggerTag: { backgroundColor: 'rgba(212,168,83,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  triggerTagText: { fontSize: 12, color: '#d4a853' },
  triggerRiepilogoSub: { fontSize: 12, color: '#4b5563', lineHeight: 18 },
  btnPrimario: { backgroundColor: '#d4a853', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 12 },
  btnPrimarioText: { color: '#080b12', fontSize: 15, fontWeight: '700' },
  btnSecondario: { padding: 12, marginBottom: 8 },
  btnSecondarioText: { fontSize: 13, color: '#4b5563' },
  btnReset: { paddingVertical: 12, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 8 },
  btnResetText: { fontSize: 13, color: '#4b5563', textDecorationLine: 'underline' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
  modalEmoji: { fontSize: 48, marginBottom: 16 },
  modalTitolo: { fontSize: 20, fontWeight: '700', color: '#f9fafb', marginBottom: 10, textAlign: 'center', fontFamily: 'Lora_700Bold' },
  modalDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBtnNo: { backgroundColor: '#d4a853', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 10 },
  modalBtnNoText: { color: '#080b12', fontSize: 14, fontWeight: '700' },
  modalBtnSi: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  modalBtnSiText: { fontSize: 13, color: '#4b5563', textDecorationLine: 'underline' },
});