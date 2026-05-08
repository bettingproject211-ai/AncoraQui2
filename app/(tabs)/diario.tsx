import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

  useEffect(() => {
    caricaImpulsi();
  }, []);

  const caricaImpulsi = async () => {
    try {
      const data = await AsyncStorageLib.getItem('impulsi');
      if (data) setImpulsi(JSON.parse(data));
    } catch (e) {}
  };

  const salvaImpulso = async () => {
    if (!triggerSel) return;
    const nuovo = {
      id: Date.now(),
      trigger: triggerSel,
      nota,
      resistito,
      ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
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

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.topbar}>
          <Text style={styles.titolo}>Diario</Text>
          <View style={styles.statPill}>
            <Text style={styles.statText}>💪 {resistitiCount} resistiti</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
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
                <Text style={styles.impulsoEmoji}>
                  {TRIGGERS.find(t => t.label === impulso.trigger)?.emoji || '💭'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.impulsoTrigger}>{impulso.trigger}</Text>
                  <Text style={styles.impulsoData}>{impulso.data} · {impulso.ora}</Text>
                </View>
                <View style={[styles.badge, impulso.resistito ? styles.badgeOk : styles.badgeNo]}>
                  <Text style={styles.badgeText}>{impulso.resistito ? '✓ Resistito' : '× Ceduto'}</Text>
                </View>
              </View>
              {impulso.nota ? (
                <Text style={styles.impulsoNota}>{impulso.nota}</Text>
              ) : null}
            </View>
          ))
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
                  onPress={() => setTriggerSel(t.label)}
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
                onPress={() => setResistito(true)}
              >
                <Text style={styles.resistitoBtnText}>✓ Sì, ho resistito</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resistitoBtn, !resistito && styles.resistitoBtnNo]}
                onPress={() => setResistito(false)}
              >
                <Text style={styles.resistitoBtnText}>× No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLbl}>NOTA (opzionale)</Text>
            <TextInput
              style={styles.notaInput}
              placeholder="Come ti sentivi?"
              placeholderTextColor="#5a5f72"
              value={nota}
              onChangeText={setNota}
              multiline
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, !triggerSel && styles.modalSaveDisabled]}
                onPress={salvaImpulso}
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
  container: { flex: 1, backgroundColor: '#06080f' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  titolo: { fontSize: 22, fontWeight: '700', color: '#ddd8cf' },
  statPill: { backgroundColor: 'rgba(106,170,130,0.08)', borderWidth: 1, borderColor: 'rgba(106,170,130,0.18)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  statText: { fontSize: 12, color: '#6aaa82' },
  addBtn: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#c9965a', borderRadius: 16, padding: 16, alignItems: 'center' },
  addBtnText: { color: '#1a0f00', fontSize: 14, fontWeight: '700' },
  empty: { padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#ddd8cf', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#5a5f72', textAlign: 'center', lineHeight: 20 },
  impulso: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 14 },
  impulsoTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  impulsoEmoji: { fontSize: 24 },
  impulsoTrigger: { fontSize: 13, fontWeight: '600', color: '#ddd8cf', marginBottom: 2 },
  impulsoData: { fontSize: 10, color: '#5a5f72' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeOk: { backgroundColor: 'rgba(106,170,130,0.1)' },
  badgeNo: { backgroundColor: 'rgba(184,92,92,0.1)' },
  badgeText: { fontSize: 10, color: '#ddd8cf' },
  impulsoNota: { fontSize: 12, color: '#5a5f72', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0c0f1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitolo: { fontSize: 18, fontWeight: '700', color: '#ddd8cf', marginBottom: 20, textAlign: 'center' },
  modalLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 2, marginBottom: 10 },
  triggers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  triggerBtn: { alignItems: 'center', backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, padding: 10, width: 80 },
  triggerBtnOn: { borderColor: 'rgba(201,150,90,0.4)', backgroundColor: 'rgba(201,150,90,0.07)' },
  triggerEmoji: { fontSize: 22, marginBottom: 4 },
  triggerLabel: { fontSize: 10, color: '#5a5f72', textAlign: 'center' },
  triggerLabelOn: { color: '#c9965a' },
  resistitoRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  resistitoBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', alignItems: 'center' },
  resistitoBtnOk: { borderColor: 'rgba(106,170,130,0.4)', backgroundColor: 'rgba(106,170,130,0.07)' },
  resistitoBtnNo: { borderColor: 'rgba(184,92,92,0.4)', backgroundColor: 'rgba(184,92,92,0.07)' },
  resistitoBtnText: { fontSize: 13, color: '#ddd8cf', fontWeight: '500' },
  notaInput: { backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, padding: 14, color: '#ddd8cf', fontSize: 13, minHeight: 60, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#111525', alignItems: 'center' },
  modalCancelText: { fontSize: 14, color: '#5a5f72' },
  modalSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#c9965a', alignItems: 'center' },
  modalSaveDisabled: { opacity: 0.4 },
  modalSaveText: { fontSize: 14, color: '#1a0f00', fontWeight: '700' },
});