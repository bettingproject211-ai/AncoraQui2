import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

const CATEGORIE = [
  { label: 'Tutti', emoji: '💬', value: 'tutti' },
  { label: 'Primo giorno', emoji: '🌱', value: 'primo_giorno' },
  { label: 'Ce la faccio', emoji: '💪', value: 'ce_la_faccio' },
  { label: 'Ho bisogno di aiuto', emoji: '🆘', value: 'aiuto' },
  { label: 'Storie di successo', emoji: '🏆', value: 'successo' },
];

const EMOJIS = ['🌊', '☀️', '🌱', '🦋', '🌙', '⭐', '🔥', '💧', '🎯', '🤝'];
const NOMI = ['Onda', 'Sole', 'Radice', 'Vento', 'Luna', 'Stella', 'Fiamma', 'Goccia', 'Ancora', 'Luce'];

const getAnonimo = () => {
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const nome = NOMI[Math.floor(Math.random() * NOMI.length)] + '_' + Math.floor(Math.random() * 99);
  return { emoji, nome };
};

const SkeletonCard = () => {
  const opacita = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacita, { toValue: 0.7, duration: 800, useNativeDriver: true }),
      Animated.timing(opacita, { toValue: 0.3, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[styles.skeletonCard, { opacity: opacita }]}>
      <View style={styles.skeletonTop}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonInfo}>
          <View style={styles.skeletonNome} />
          <View style={styles.skeletonTempo} />
        </View>
      </View>
      <View style={styles.skeletonTitolo} />
      <View style={styles.skeletonTesto} />
    </Animated.View>
  );
};

export default function ForumScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('tutti');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errore, setErrore] = useState(false);
  const [nuovoPostModal, setNuovoPostModal] = useState(false);
  const [postDettaglio, setPostDettaglio] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [titoloNuovo, setTitoloNuovo] = useState('');
  const [testoNuovo, setTestoNuovo] = useState('');
  const [categoriaNuova, setCategoriaNuova] = useState('generale');
  const [testoRisposta, setTestoRisposta] = useState('');
  const [invio, setInvio] = useState(false);

  useFocusEffect(useCallback(() => { caricaPosts(); }, []));

  const caricaPosts = async () => {
    try {
      setErrore(false);
      let query = supabase.from('forum_posts').select('*').order('created_at', { ascending: false }).limit(30);
      if (categoriaSelezionata !== 'tutti') query = query.eq('categoria', categoriaSelezionata);
      const { data, error } = await query;
      if (error) throw error;
      if (data) setPosts(data);
    } catch (e) { setErrore(true); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { caricaPosts(); }, [categoriaSelezionata]);

  const caricaReplies = async (postId: string) => {
    setLoadingReplies(true);
    try {
      const { data } = await supabase.from('forum_replies').select('*').eq('post_id', postId).order('created_at', { ascending: true });
      if (data) setReplies(data);
    } catch (e) {}
    finally { setLoadingReplies(false); }
  };

  const apriPost = (post: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPostDettaglio(post);
    caricaReplies(post.id);
  };

  const inviaPost = async () => {
    if (!titoloNuovo.trim() || !testoNuovo.trim()) return;
    setInvio(true);
    try {
      const { emoji, nome } = getAnonimo();
      const { error } = await supabase.from('forum_posts').insert({
        titolo: titoloNuovo.trim().slice(0, 100),
        testo: testoNuovo.trim().slice(0, 500),
        emoji, nickname: nome,
        categoria: categoriaNuova,
      });
      if (!error) {
        setTitoloNuovo(''); setTestoNuovo(''); setCategoriaNuova('generale');
        setNuovoPostModal(false);
        caricaPosts();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {}
    finally { setInvio(false); }
  };

  const inviaRisposta = async () => {
    if (!testoRisposta.trim() || !postDettaglio) return;
    setInvio(true);
    try {
      const { emoji, nome } = getAnonimo();
      const { error } = await supabase.from('forum_replies').insert({
        post_id: postDettaglio.id,
        testo: testoRisposta.trim().slice(0, 500),
        emoji, nickname: nome,
      });
      if (!error) {
        setTestoRisposta('');
        caricaReplies(postDettaglio.id);
        await supabase.from('forum_posts').update({ reply_count: (postDettaglio.reply_count || 0) + 1 }).eq('id', postDettaglio.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {}
    finally { setInvio(false); }
  };

  const formatTempo = (created_at: string) => {
    const diff = Date.now() - new Date(created_at).getTime();
    const ore = Math.floor(diff / 3600000);
    if (ore < 1) return 'poco fa';
    if (ore < 24) return `${ore}h fa`;
    return `${Math.floor(ore / 24)}g fa`;
  };

  const catLabel = CATEGORIE.find(c => c.value === categoriaSelezionata);

  return (
    <View style={styles.container}>

      {/* DETTAGLIO POST */}
      <Modal visible={!!postDettaglio} transparent animationType="slide">
        <View style={styles.modalDettaglioBg}>
          <View style={styles.modalDettaglio}>
            <View style={styles.dettaglioHeader}>
              <TouchableOpacity onPress={() => { setPostDettaglio(null); setReplies([]); }}>
                <Text style={styles.dettaglioChiudi}>← Torna</Text>
              </TouchableOpacity>
              <View style={[styles.catBadge, { backgroundColor: 'rgba(201,150,90,0.1)' }]}>
                <Text style={styles.catBadgeText}>{CATEGORIE.find(c => c.value === postDettaglio?.categoria)?.emoji} {CATEGORIE.find(c => c.value === postDettaglio?.categoria)?.label}</Text>
              </View>
            </View>
            <ScrollView style={styles.dettaglioScroll}>
              <View style={styles.dettaglioPost}>
                <View style={styles.postTopRow}>
                  <View style={styles.avatar}><Text style={styles.avEmoji}>{postDettaglio?.emoji}</Text></View>
                  <View>
                    <Text style={styles.postNome}>{postDettaglio?.nickname}</Text>
                    <Text style={styles.postTempo}>{formatTempo(postDettaglio?.created_at || '')}</Text>
                  </View>
                </View>
                <Text style={styles.dettaglioTitolo}>{postDettaglio?.titolo}</Text>
                <Text style={styles.dettaglioTesto}>{postDettaglio?.testo}</Text>
              </View>

              <Text style={styles.repliesLbl}>RISPOSTE — {replies.length}</Text>
              {loadingReplies ? <SkeletonCard /> : replies.map(r => (
                <View key={r.id} style={styles.replyCard}>
                  <View style={styles.postTopRow}>
                    <View style={styles.avatarSmall}><Text style={styles.avEmojiSmall}>{r.emoji}</Text></View>
                    <View>
                      <Text style={styles.postNome}>{r.nickname}</Text>
                      <Text style={styles.postTempo}>{formatTempo(r.created_at)}</Text>
                    </View>
                  </View>
                  <Text style={styles.replyTesto}>{r.testo}</Text>
                </View>
              ))}
              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.rispostaBox}>
              <TextInput
                style={styles.rispostaInput}
                placeholder="Scrivi una risposta..."
                placeholderTextColor="#5a5f72"
                value={testoRisposta}
                onChangeText={setTestoRisposta}
                multiline
              />
              <TouchableOpacity style={styles.rispostaBtn} onPress={inviaRisposta} disabled={invio}>
                <Text style={styles.rispostaBtnText}>{invio ? '...' : '→'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NUOVO POST */}
      <Modal visible={nuovoPostModal} transparent animationType="slide">
        <View style={styles.modalNuovoBg}>
          <View style={styles.modalNuovo}>
            <Text style={styles.modalNuovoTitolo}>Nuovo post</Text>
            <Text style={styles.modalNuovoLbl}>CATEGORIA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIE.slice(1).map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.catPill, categoriaNuova === c.value && styles.catPillOn]}
                    onPress={() => setCategoriaNuova(c.value)}
                  >
                    <Text style={styles.catPillText}>{c.emoji} {c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={styles.modalNuovoLbl}>TITOLO</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Un titolo breve..."
              placeholderTextColor="#5a5f72"
              value={titoloNuovo}
              onChangeText={t => setTitoloNuovo(t.slice(0, 100))}
            />
            <Text style={styles.modalNuovoLbl}>MESSAGGIO</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 80 }]}
              placeholder="Scrivi qui..."
              placeholderTextColor="#5a5f72"
              value={testoNuovo}
              onChangeText={t => setTestoNuovo(t.slice(0, 500))}
              multiline
            />
            <View style={styles.modalNuovoBtns}>
              <TouchableOpacity style={styles.modalNuovoCancel} onPress={() => setNuovoPostModal(false)}>
                <Text style={styles.modalNuovoCancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalNuovoSave, (!titoloNuovo || !testoNuovo) && { opacity: 0.4 }]}
                onPress={inviaPost} disabled={invio}
              >
                <Text style={styles.modalNuovoSaveText}>{invio ? '...' : 'Pubblica'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LISTA POST */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); caricaPosts(); }} tintColor="#c9965a" colors={['#c9965a']} />}
      >
        <View style={styles.topbar}>
          <Text style={styles.titolo}>Forum</Text>
          <TouchableOpacity style={styles.nuovoBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNuovoPostModal(true); }}>
            <Text style={styles.nuovoBtnText}>+ Nuovo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.anonNote}>
          <Text style={styles.anonText}>Anonimo · Senza giudizio · Solo persone vere</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriePill}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20 }}>
            {CATEGORIE.map(c => (
              <TouchableOpacity
                key={c.value}
                style={[styles.catTab, categoriaSelezionata === c.value && styles.catTabOn]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategoriaSelezionata(c.value); }}
              >
                <Text style={[styles.catTabText, categoriaSelezionata === c.value && styles.catTabTextOn]}>
                  {c.emoji} {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : errore ? (
          <View style={styles.erroreBox}>
            <Text style={styles.erroreEmoji}>📡</Text>
            <Text style={styles.erroreTitolo}>Connessione assente</Text>
            <TouchableOpacity style={styles.erroreBtn} onPress={caricaPosts}>
              <Text style={styles.erroreBtnText}>Riprova</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitolo}>Nessun post ancora</Text>
            <Text style={styles.emptySub}>Sii il primo a scrivere qualcosa.</Text>
          </View>
        ) : (
          posts.map(post => (
            <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => apriPost(post)}>
              <View style={styles.postCardTop}>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>
                    {CATEGORIE.find(c => c.value === post.categoria)?.emoji} {CATEGORIE.find(c => c.value === post.categoria)?.label || 'Generale'}
                  </Text>
                </View>
                <Text style={styles.postTempo}>{formatTempo(post.created_at)}</Text>
              </View>
              <Text style={styles.postTitolo}>{post.titolo}</Text>
              <Text style={styles.postAnteprima} numberOfLines={2}>{post.testo}</Text>
              <View style={styles.postFooter}>
                <View style={styles.postAutore}>
                  <Text style={styles.postAutoreEmoji}>{post.emoji}</Text>
                  <Text style={styles.postAutoreNome}>{post.nickname}</Text>
                </View>
                <Text style={styles.postReplies}>💬 {post.reply_count || 0}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  titolo: { fontSize: 26, fontWeight: '700', color: '#ddd8cf', fontFamily: 'Lora_700Bold' },
  nuovoBtn: { backgroundColor: '#c9965a', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16 },
  nuovoBtnText: { color: '#1a0f00', fontSize: 13, fontWeight: '700' },
  anonNote: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 12, padding: 10 },
  anonText: { fontSize: 11, color: '#5a5f72', textAlign: 'center', fontStyle: 'italic' },
  categoriePill: { marginBottom: 14 },
  catTab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a' },
  catTabOn: { backgroundColor: 'rgba(201,150,90,0.1)', borderColor: 'rgba(201,150,90,0.4)' },
  catTabText: { fontSize: 12, color: '#5a5f72' },
  catTabTextOn: { color: '#c9965a', fontWeight: '600' },
  postCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 16 },
  postCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catBadge: { backgroundColor: 'rgba(201,150,90,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeText: { fontSize: 10, color: '#c9965a' },
  postTitolo: { fontSize: 15, fontWeight: '700', color: '#ddd8cf', marginBottom: 6, lineHeight: 22 },
  postAnteprima: { fontSize: 12, color: '#5a5f72', lineHeight: 18, marginBottom: 12 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postAutore: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postAutoreEmoji: { fontSize: 14 },
  postAutoreNome: { fontSize: 11, color: '#5a5f72' },
  postReplies: { fontSize: 11, color: '#5a5f72' },
  postTempo: { fontSize: 10, color: '#5a5f72' },
  empty: { padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitolo: { fontSize: 16, fontWeight: '600', color: '#ddd8cf', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#5a5f72', textAlign: 'center' },
  erroreBox: { padding: 40, alignItems: 'center' },
  erroreEmoji: { fontSize: 40, marginBottom: 12 },
  erroreTitolo: { fontSize: 16, fontWeight: '600', color: '#ddd8cf', marginBottom: 16 },
  erroreBtn: { backgroundColor: '#c9965a', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24 },
  erroreBtnText: { color: '#1a0f00', fontSize: 13, fontWeight: '700' },
  skeletonCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 16 },
  skeletonTop: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  skeletonAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1e2336' },
  skeletonInfo: { flex: 1, gap: 6 },
  skeletonNome: { height: 10, backgroundColor: '#1e2336', borderRadius: 5, width: '40%' },
  skeletonTempo: { height: 8, backgroundColor: '#1e2336', borderRadius: 4, width: '25%' },
  skeletonTitolo: { height: 12, backgroundColor: '#1e2336', borderRadius: 5, width: '80%', marginBottom: 8 },
  skeletonTesto: { height: 10, backgroundColor: '#1e2336', borderRadius: 5, width: '60%' },
  modalDettaglioBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalDettaglio: { flex: 1, backgroundColor: '#06080f', marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  dettaglioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#181c2a' },
  dettaglioChiudi: { fontSize: 14, color: '#c9965a', fontWeight: '600' },
  dettaglioScroll: { flex: 1 },
  dettaglioPost: { margin: 20, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 16 },
  postTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(201,150,90,0.15)', alignItems: 'center', justifyContent: 'center' },
  avEmoji: { fontSize: 16 },
  avatarSmall: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(93,143,168,0.15)', alignItems: 'center', justifyContent: 'center' },
  avEmojiSmall: { fontSize: 12 },
  postNome: { fontSize: 12, fontWeight: '600', color: '#ddd8cf' },
  dettaglioTitolo: { fontSize: 18, fontWeight: '700', color: '#ddd8cf', marginBottom: 10, lineHeight: 26, fontFamily: 'Lora_700Bold' },
  dettaglioTesto: { fontSize: 13, color: '#a8a29a', lineHeight: 22 },
  repliesLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 2, marginHorizontal: 20, marginTop: 10, marginBottom: 8 },
  replyCard: { marginHorizontal: 20, marginBottom: 8, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 14, padding: 12 },
  replyTesto: { fontSize: 13, color: '#ddd8cf', lineHeight: 20 },
  rispostaBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#181c2a', backgroundColor: '#0c0f1a' },
  rispostaInput: { flex: 1, color: '#ddd8cf', fontSize: 13, minHeight: 40, backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  rispostaBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#c9965a', alignItems: 'center', justifyContent: 'center' },
  rispostaBtnText: { color: '#1a0f00', fontSize: 16, fontWeight: '700' },
  modalNuovoBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalNuovo: { backgroundColor: '#0c0f1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalNuovoTitolo: { fontSize: 18, fontWeight: '700', color: '#ddd8cf', marginBottom: 20, textAlign: 'center', fontFamily: 'Lora_700Bold' },
  modalNuovoLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 2, marginBottom: 8 },
  modalInput: { backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, padding: 14, color: '#ddd8cf', fontSize: 14, marginBottom: 14 },
  catPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336' },
  catPillOn: { backgroundColor: 'rgba(201,150,90,0.1)', borderColor: 'rgba(201,150,90,0.4)' },
  catPillText: { fontSize: 12, color: '#5a5f72' },
  modalNuovoBtns: { flexDirection: 'row', gap: 10 },
  modalNuovoCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#111525', alignItems: 'center' },
  modalNuovoCancelText: { fontSize: 14, color: '#5a5f72' },
  modalNuovoSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#c9965a', alignItems: 'center' },
  modalNuovoSaveText: { fontSize: 14, color: '#1a0f00', fontWeight: '700' },
});