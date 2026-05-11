import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TRIGGERS = [
  { emoji: '😴', label: 'Stanchezza' },
  { emoji: '😔', label: 'Solitudine' },
  { emoji: '😤', label: 'Nervosismo' },
  { emoji: '😶', label: 'Noia' },
  { emoji: '💬', label: 'Discussione' },
  { emoji: '🍺', label: 'Alcol' },
];

export default function DiarioScreen() {
  const [impulsi, setImpulsi] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [triggerSel, setTriggerSel] = useState('');
  const [nota, setNota] = useState('');
  const [resistito, setResistito] = useState(true);
  const [vista, setVista] = useState<'diario' | 'statistiche'>('diario');

  useEffect(() => { caricaImpulsi(); }, []);

  const caricaImpulsi = async () => {
    try {
      const data = await AsyncStorageLib.getItem('impulsi');
      if (data) setImpulsi(JSON.parse(data));
    } catch (e) {}
  };

  const salvaImpulso = async () => {
    if (!triggerSel) return;
    const nuovo = {
      id: Date.now(), trigger: triggerSel, nota, resistito,
      ora: new Date().getHours(),
      oraLabel: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      data: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
    };
    const nuovi = [nuovo, ...impulsi];
    setImpulsi(nuovi);
    await AsyncStorageLib.setItem('impulsi', JSON.stringify(nuovi));
    setModalVisible(false);
    setTriggerSel('');
    setNota('');
    setResistito(true);
  };

  const resistitiCount = impulsi.filter(i => i.resistito).length;
  const cedutiCount = impulsi.filter(i => !i.resistito).length;

  const triggerStats = TRIGGERS.map(t => ({
    ...t, count: impulsi.filter(i => i.trigger === t.label).length,
  })).filter(t => t.count > 0).sort((a, b) => b.count - a.count);

  const oreStats = impulsi.reduce((acc: any, i) => {
    const fascia = i.ora < 6 ? 'Notte' : i.ora < 12 ? 'Mattina' : i.ora < 18 ? 'Pomeriggio' : 'Sera';
    acc[fascia] = (acc[fascia] || 0) + 1;
    return acc;
  }, {});
  const oraRischio = Object.entries(oreStats).sort((a: any, b: any) => b[1] - a[1])[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080b12" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        <View style={styles.header}>
          <View>
            <Text style={styles.logoSub}>il tuo</Text>
            <Text style={styles.logo}>Diario</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statText}>💪 {resistitiCount} resistiti</Text>
          </View>
        </View>

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, vista === 'diario' && styles.toggleBtnOn]}
            onPress={() => setVista('diario')} activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, vista === 'diario' && styles.toggleTextOn]}>📓 Diario</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, vista === 'statistiche' && styles.toggleBtnOn]}
            onPress={() => setVista('statistiche')} activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, vista === 'statistiche' && styles.toggleTextOn]}>📊 Pattern</Text>
          </TouchableOpacity>
        </View>

        {vista === 'diario' ? (
          <>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>+ Registra un impulso</Text>
            </TouchableOpacity>

            {impulsi.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📓</Text>
                <Text style={styles.emptyTitle}>Nessun impulso registrato</Text>
                <Text style={styles.emptySub}>Ogni volta che senti l'impulso — resistito o no — registralo. Nel tempo capirai i tuoi pattern.</Text>
              </View>
            ) : (
              impulsi.map((impulso) => (
                <View key={impulso.id} style={styles.impulso}>
                  <View style={styles.impulsoTop}>
                    <View style={styles.impulsoIconWrap}>
                      <Text style={styles.impulsoEmoji}>
                        {TRIGGERS.find(t => t.label === impulso.trigger)?.emoji || '💭'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.impulsoTrigger}>{impulso.trigger}</Text>
                      <Text style={styles.impulsoData}>{impulso.data} · {impulso.oraLabel}</Text>
                    </View>
                    <View style={[styles.badge, impulso.resistito ? styles.badgeOk : styles.badgeNo]}>
                      <Text style={[styles.badgeText, impulso.resistito ? styles.badgeOkText : styles.badgeNoText]}>
                        {impulso.resistito ? '✓ Resistito' : '× Ceduto'}
                      </Text>
                    </View>
                  </View>
                  {impulso.nota ? <Text style={styles.impulsoNota}>{impulso.nota}</Text> : null}
                </View>
              ))
            )}
          </>
        ) : (
          <>
            {impulsi.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyTitle}>Nessun dato ancora</Text>
                <Text style={styles.emptySub}>Registra almeno un impulso per vedere i tuoi pattern.</Text>
              </View>
            ) : (
              <>
                <View style={styles.riepilogo}>
                  <View style={styles.riepilogoItem}>
                    <Text style={styles.riepilogoNum}>{impulsi.length}</Text>
                    <Text style={styles.riepilogoLbl}>Totale</Text>
                  </View>
                  <View style={styles.riepilogoDivider} />
                  <View style={styles.riepilogoItem}>
                    <Text style={[styles.riepilogoNum, { color: '#10b981' }]}>{resistitiCount}</Text>
                    <Text style={styles.riepilogoLbl}>Resistiti</Text>
                  </View>
                  <View style={styles.riepilogoDivider} />
                  <View style={styles.riepilogoItem}>
                    <Text style={[styles.riepilogoNum, { color: '#ef4444' }]}>{cedutiCount}</Text>
                    <Text style={styles.riepilogoLbl}>Ceduti</Text>
                  </View>
                  <View style={styles.riepilogoDivider} />
                  <View style={styles.riepilogoItem}>
                    <Text style={[styles.riepilogoNum, { color: '#d4a853' }]}>
                      {impulsi.length > 0 ? Math.round((resistitiCount / impulsi.length) * 100) : 0}%
                    </Text>
                    <Text style={styles.riepilogoLbl}>Tasso</Text>
                  </View>
                </View>

                {oraRischio && (
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLbl}>ORA PIÙ A RISCHIO</Text>
                    <Text style={styles.statCardVal}>🕐 {oraRischio[0]}</Text>
                    <Text style={styles.statCardDesc}>
                      La maggior parte dei tuoi impulsi arriva di {(oraRischio[0] as string).toLowerCase()}. Stai più attento in quel momento.
                    </Text>
                  </View>
                )}

                {triggerStats.length > 0 && (
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLbl}>I TUOI TRIGGER</Text>
                    {triggerStats.map(t => (
                      <View key={t.label} style={styles.triggerStatRow}>
                        <Text style={styles.triggerStatEmoji}>{t.emoji}</Text>
                        <Text style={styles.triggerStatLabel}>{t.label}</Text>
                        <View style={styles.triggerStatBarWrap}>
                          <View style={[styles.triggerStatBar, { width: `${(t.count / impulsi.length) * 100}%` }]} />
                        </View>
                        <Text style={styles.triggerStatCount}>{t.count}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitolo}>Registra impulso</Text>
            <Text style={styles.modalLbl}>COSA L'HA SCATENATO?</Text>
            <View style={styles.triggers}>
              {TRIGGERS.map(t => (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.triggerBtn, triggerSel === t.label && styles.triggerBtnOn]}
                  onPress={() => setTriggerSel(t.label)} activeOpacity={0.7}
                >
                  <Text style={styles.triggerEmoji}>{t.emoji}</Text>
                  <Text style={[styles.triggerLabel, triggerSel === t.label && styles.triggerLabelOn]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLbl}>HAI RESISTITO?</Text>
            <View style={styles.resistitoRow}>
              <TouchableOpacity
                style={[styles.resistitoBtn, resistito && styles.resistitoBtnOk]}
                onPress={() => setResistito(true)} activeOpacity={0.8}
              >
                <Text style={styles.resistitoBtnText}>✓ Sì, ho resistito</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resistitoBtn, !resistito && styles.resistitoBtnNo]}
                onPress={() => setResistito(false)} activeOpacity={0.8}
              >
                <Text style={styles.resistitoBtnText}>× No</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLbl}>NOTA (opzionale)</Text>
            <TextInput
              style={styles.notaInput}
              placeholder="Come ti sentivi?"
              placeholderTextColor="#4b5563"
              value={nota}
              onChangeText={setNota}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, !triggerSel && { opacity: 0.4 }]}
                onPress={salvaImpulso} activeOpacity={0.8}
              >
                <Text style={styles.modalSaveText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080b12' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 },
  logoSub: { fontSize: 10, color: '#4b5563', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 },
  logo: { fontSize: 26, fontWeight: '700', color: '#d4a853', letterSpacing: 1 },
  statPill: { backgroundColor: 'rgba(16,185,129,0.07)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  statText: { fontSize: 12, color: '#10b981' },
  toggle: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 14, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  toggleBtnOn: { backgroundColor: '#d4a853' },
  toggleText: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
  toggleTextOn: { color: '#080b12', fontWeight: '700' },
  addBtn: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#d4a853', borderRadius: 16, padding: 16, alignItems: 'center' },
  addBtnText: { color: '#080b12', fontSize: 14, fontWeight: '700' },
  empty: { padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#f9fafb', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#4b5563', textAlign: 'center', lineHeight: 20 },
  impulso: { marginHorizontal: 20, marginBottom: 10, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 14 },
  impulsoTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  impulsoIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  impulsoEmoji: { fontSize: 20 },
  impulsoTrigger: { fontSize: 14, fontWeight: '600', color: '#f9fafb', marginBottom: 2 },
  impulsoData: { fontSize: 11, color: '#4b5563' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeOk: { backgroundColor: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' },
  badgeNo: { backgroundColor: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  badgeOkText: { color: '#10b981' },
  badgeNoText: { color: '#ef4444' },
  impulsoNota: { fontSize: 12, color: '#6b7280', marginTop: 10, fontStyle: 'italic', lineHeight: 18 },
  riepilogo: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 16 },
  riepilogoItem: { flex: 1, alignItems: 'center' },
  riepilogoNum: { fontSize: 22, fontWeight: '700', color: '#f9fafb', marginBottom: 4, fontFamily: 'Lora_700Bold' },
  riepilogoLbl: { fontSize: 10, color: '#4b5563' },
  riepilogoDivider: { width: 1, backgroundColor: '#1a2030' },
  statCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 16 },
  statCardLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  statCardVal: { fontSize: 20, fontWeight: '700', color: '#f9fafb', marginBottom: 6 },
  statCardDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  triggerStatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  triggerStatEmoji: { fontSize: 16, width: 24 },
  triggerStatLabel: { fontSize: 12, color: '#f9fafb', width: 90 },
  triggerStatBarWrap: { flex: 1, height: 5, backgroundColor: '#1a2030', borderRadius: 3, overflow: 'hidden' },
  triggerStatBar: { height: '100%', backgroundColor: '#d4a853', borderRadius: 3 },
  triggerStatCount: { fontSize: 12, color: '#4b5563', width: 20, textAlign: 'right' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0d1117', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitolo: { fontSize: 18, fontWeight: '700', color: '#f9fafb', marginBottom: 20, textAlign: 'center', fontFamily: 'Lora_700Bold' },
  modalLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  triggers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  triggerBtn: { alignItems: 'center', backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030', borderRadius: 12, padding: 10, width: 80 },
  triggerBtnOn: { borderColor: 'rgba(212,168,83,0.4)', backgroundColor: 'rgba(212,168,83,0.07)' },
  triggerEmoji: { fontSize: 22, marginBottom: 4 },
  triggerLabel: { fontSize: 10, color: '#4b5563', textAlign: 'center' },
  triggerLabelOn: { color: '#d4a853' },
  resistitoRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  resistitoBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030', alignItems: 'center' },
  resistitoBtnOk: { borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.07)' },
  resistitoBtnNo: { borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.07)' },
  resistitoBtnText: { fontSize: 13, color: '#f9fafb', fontWeight: '500' },
  notaInput: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 13, minHeight: 60, marginBottom: 20, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center' },
  modalCancelText: { fontSize: 14, color: '#6b7280' },
  modalSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#d4a853', alignItems: 'center' },
  modalSaveText: { fontSize: 14, color: '#080b12', fontWeight: '700' },
});