import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated, KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
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

const PAROLE_VIETATE = [
  'vaffanculo', 'cazzo', 'merda', 'stronzo', 'puttana',
  'figlio di puttana', 'bastardo', 'idiota', 'imbecille',
];

const PAROLE_CRISI = [
  'voglio morire', 'mi voglio ammazzare', 'non ce la faccio più',
  'voglio farmi del male', 'suicidio', 'ammazzarmi', 'farla finita',
  'non ha senso vivere', 'voglio sparire', 'me ne vado per sempre',
  'mi faccio del male', 'mi taglio', 'non voglio più vivere',
];

const contieneCrisi = (testo: string) => PAROLE_CRISI.some(p => testo.toLowerCase().includes(p));

const filtroParole = (testo: string): string => {
  let result = testo;
  PAROLE_VIETATE.forEach(p => {
    result = result.replace(new RegExp(p, 'gi'), '*'.repeat(p.length));
  });
  return result;
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
  const [regolamentoModal, setRegolamentoModal] = useState(false);
  const [postDettaglio, setPostDettaglio] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [titoloNuovo, setTitoloNuovo] = useState('');
  const [testoNuovo, setTestoNuovo] = useState('');
  const [categoriaNuova, setCategoriaNuova] = useState('primo_giorno');
  const [testoRisposta, setTestoRisposta] = useState('');
  const [invio, setInvio] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [myNickname, setMyNickname] = useState<{ emoji: string; nome: string } | null>(null);
  const [contattoNome, setContattoNome] = useState('');
  const [contattoNumero, setContattoNumero] = useState('');
  const [rispostaMenzione, setRispostaMenzione] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(useCallback(() => {
    inizializza();
    caricaPosts();
    caricaLikes();
  }, []));

  useEffect(() => { caricaPosts(); }, [categoriaSelezionata]);

  useEffect(() => {
    if (replies.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
    }
  }, [replies]);

  const inizializza = async () => {
    try {
      const nickStr = await AsyncStorageLib.getItem('forum_nickname');
      if (nickStr) {
        setMyNickname(JSON.parse(nickStr));
      } else {
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const nome = NOMI[Math.floor(Math.random() * NOMI.length)] + '_' + Math.floor(Math.random() * 99);
        const nick = { emoji, nome };
        await AsyncStorageLib.setItem('forum_nickname', JSON.stringify(nick));
        setMyNickname(nick);
      }
      const cn = await AsyncStorageLib.getItem('contattoNome');
      const cnum = await AsyncStorageLib.getItem('contattoNumero');
      setContattoNome(cn || '');
      setContattoNumero(cnum || '');
      const visto = await AsyncStorageLib.getItem('forum_regolamento_visto');
      if (!visto) setRegolamentoModal(true);
    } catch (e) {}
  };

  const caricaLikes = async () => {
    try {
      const likesStr = await AsyncStorageLib.getItem('forum_likes');
      if (likesStr) setLikedPosts(new Set(JSON.parse(likesStr)));
    } catch (e) {}
  };

  const caricaPosts = async () => {
    try {
      setErrore(false);
      let query = supabase.from('forum_posts').select('*').eq('reported', false).order('created_at', { ascending: false }).limit(30);
      if (categoriaSelezionata !== 'tutti') query = query.eq('categoria', categoriaSelezionata);
      const { data, error } = await query;
      if (error) throw error;
      if (data) setPosts(data);
    } catch (e) { setErrore(true); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const caricaReplies = async (postId: string) => {
    setLoadingReplies(true);
    try {
      const { data } = await supabase.from('forum_replies').select('*').eq('post_id', postId).eq('reported', false).order('created_at', { ascending: true });
      if (data) setReplies(data);
    } catch (e) {}
    finally { setLoadingReplies(false); }
  };

  const apriPost = (post: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPostDettaglio(post);
    setRispostaMenzione('');
    caricaReplies(post.id);
  };

  const mostraAlertCrisi = () => {
    const buttons: any[] = [];
    if (contattoNumero) {
      buttons.push({ text: `💙 ${contattoNome || 'Persona di fiducia'}`, onPress: () => Linking.openURL(`tel:${contattoNumero}`) });
    }
    buttons.push({ text: '📞 SerD 800 274 274', onPress: () => Linking.openURL('tel:800274274') });
    buttons.push({ text: '🆘 112', onPress: () => Linking.openURL('tel:112'), style: 'destructive' });
    buttons.push({ text: 'Continua a scrivere', style: 'cancel' });
    Alert.alert('💙 Sei al sicuro?', 'Sembra che tu stia attraversando un momento molto difficile.\n\nNon sei solo/a. Vuoi parlare con qualcuno?', buttons);
  };

  const inviaPost = async () => {
    if (!titoloNuovo.trim() || !testoNuovo.trim() || !myNickname) return;
    if (contieneCrisi(testoNuovo) || contieneCrisi(titoloNuovo)) { mostraAlertCrisi(); return; }
    setInvio(true);
    try {
      const { error } = await supabase.from('forum_posts').insert({
        titolo: filtroParole(titoloNuovo.trim().slice(0, 100)),
        testo: filtroParole(testoNuovo.trim().slice(0, 500)),
        emoji: myNickname.emoji, nickname: myNickname.nome, categoria: categoriaNuova,
      });
      if (!error) {
        setTitoloNuovo(''); setTestoNuovo(''); setCategoriaNuova('primo_giorno');
        setNuovoPostModal(false); caricaPosts();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {}
    finally { setInvio(false); }
  };

  const inviaRisposta = async () => {
    if (!testoRisposta.trim() || !postDettaglio || !myNickname) return;
    if (contieneCrisi(testoRisposta)) { mostraAlertCrisi(); return; }
    setInvio(true);
    try {
      const testo = rispostaMenzione ? `@${rispostaMenzione} ${testoRisposta.trim()}` : testoRisposta.trim();
      const { error } = await supabase.from('forum_replies').insert({
        post_id: postDettaglio.id, testo: filtroParole(testo.slice(0, 500)),
        emoji: myNickname.emoji, nickname: myNickname.nome,
      });
      if (!error) {
        setTestoRisposta(''); setRispostaMenzione('');
        caricaReplies(postDettaglio.id);
        await supabase.from('forum_posts').update({ reply_count: (postDettaglio.reply_count || 0) + 1 }).eq('id', postDettaglio.id);
        setPostDettaglio({ ...postDettaglio, reply_count: (postDettaglio.reply_count || 0) + 1 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {}
    finally { setInvio(false); }
  };

  const toggleLike = async (postId: string, likeAttuale: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLiked = new Set(likedPosts);
    const giaLiked = newLiked.has(postId);
    if (giaLiked) { newLiked.delete(postId); } else { newLiked.add(postId); }
    setLikedPosts(newLiked);
    await AsyncStorageLib.setItem('forum_likes', JSON.stringify([...newLiked]));
    const nuovoCount = giaLiked ? likeAttuale - 1 : likeAttuale + 1;
    await supabase.from('forum_posts').update({ likes: nuovoCount }).eq('id', postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: nuovoCount } : p));
    if (postDettaglio?.id === postId) setPostDettaglio({ ...postDettaglio, likes: nuovoCount });
  };

  const segnalaPost = (postId: string) => {
    Alert.alert('Segnala post', 'Vuoi segnalare questo contenuto?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Segnala', style: 'destructive',
        onPress: async () => {
          const post = posts.find(p => p.id === postId);
          const nuovoCount = (post?.report_count || 0) + 1;
          const daNascondere = nuovoCount >= 3;
          await supabase.from('forum_posts').update({ report_count: nuovoCount, reported: daNascondere }).eq('id', postId);
          setPosts(prev => daNascondere ? prev.filter(p => p.id !== postId) : prev.map(p => p.id === postId ? { ...p, report_count: nuovoCount } : p));
          if (daNascondere && postDettaglio?.id === postId) { setPostDettaglio(null); setReplies([]); }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('Grazie', daNascondere ? 'Contenuto rimosso.' : 'Segnalazione registrata.');
        }
      }
    ]);
  };

  const segnalaRisposta = (replyId: string) => {
    Alert.alert('Segnala risposta', 'Vuoi segnalare questa risposta?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Segnala', style: 'destructive',
        onPress: async () => {
          const reply = replies.find(r => r.id === replyId);
          const nuovoCount = (reply?.report_count || 0) + 1;
          const daNascondere = nuovoCount >= 3;
          await supabase.from('forum_replies').update({ report_count: nuovoCount, reported: daNascondere }).eq('id', replyId);
          setReplies(prev => daNascondere ? prev.filter(r => r.id !== replyId) : prev.map(r => r.id === replyId ? { ...r, report_count: nuovoCount } : r));
          Alert.alert('Grazie', 'Segnalazione registrata.');
        }
      }
    ]);
  };

  const accettaRegolamento = async () => {
    await AsyncStorageLib.setItem('forum_regolamento_visto', 'true');
    setRegolamentoModal(false);
  };

  const formatTempo = (created_at: string) => {
    const diff = Date.now() - new Date(created_at).getTime();
    const ore = Math.floor(diff / 3600000);
    if (ore < 1) return 'poco fa';
    if (ore < 24) return `${ore}h fa`;
    return `${Math.floor(ore / 24)}g fa`;
  };

  const getCatColore = (value: string) => {
    const colori: Record<string, string> = {
      primo_giorno: '#10b981', ce_la_faccio: '#3b82f6',
      aiuto: '#ef4444', successo: '#d4a853', tutti: '#6b7280',
    };
    return colori[value] || '#6b7280';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080b12" />

      {/* MODAL REGOLAMENTO */}
      <Modal visible={regolamentoModal} transparent animationType="slide">
        <View style={styles.modalRegBg}>
          <View style={styles.modalReg}>
            <Text style={styles.modalRegTitolo}>💬 Benvenuto nel Forum</Text>
            <Text style={styles.modalRegSub}>Uno spazio anonimo e sicuro. Leggi prima di entrare.</Text>
            <View style={styles.regolaBuona}>
              <Text style={styles.regolaText}>✓  Parla liberamente della tua esperienza</Text>
              <Text style={styles.regolaText}>✓  Supporta gli altri senza giudicare</Text>
              <Text style={styles.regolaText}>✓  Sei completamente anonimo</Text>
            </View>
            <View style={styles.regolaVietata}>
              <Text style={styles.regolaVietataText}>✗  No offese o contenuti violenti</Text>
              <Text style={styles.regolaVietataText}>✗  No dati personali</Text>
              <Text style={styles.regolaVietataText}>✗  No link a siti di gioco</Text>
            </View>
            {myNickname && (
              <View style={styles.regolaNickname}>
                <Text style={styles.regolaNicknameLbl}>IL TUO NICKNAME</Text>
                <Text style={styles.regolaNicknameVal}>{myNickname.emoji} {myNickname.nome}</Text>
                <Text style={styles.regolaNicknameSub}>Fisso e anonimo. Nessuno può tracciarti.</Text>
              </View>
            )}
            <TouchableOpacity style={styles.regBtn} onPress={accettaRegolamento} activeOpacity={0.8}>
              <Text style={styles.regBtnText}>Entra nel Forum →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DETTAGLIO POST */}
      <Modal visible={!!postDettaglio} transparent animationType="slide">
        <View style={styles.modalDettaglioBg}>
          <View style={styles.modalDettaglio}>
            <View style={styles.dettaglioHeader}>
              <TouchableOpacity onPress={() => { setPostDettaglio(null); setReplies([]); setRispostaMenzione(''); }} activeOpacity={0.7}>
                <Text style={styles.dettaglioChiudi}>← Torna</Text>
              </TouchableOpacity>
              <View style={[styles.catBadge, { backgroundColor: getCatColore(postDettaglio?.categoria) + '15', borderColor: getCatColore(postDettaglio?.categoria) + '30' }]}>
                <Text style={[styles.catBadgeText, { color: getCatColore(postDettaglio?.categoria) }]}>
                  {CATEGORIE.find(c => c.value === postDettaglio?.categoria)?.emoji} {CATEGORIE.find(c => c.value === postDettaglio?.categoria)?.label}
                </Text>
              </View>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.dettaglioScroll}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => { if (replies.length > 0) scrollRef.current?.scrollToEnd({ animated: true }); }}
            >
              <View style={styles.dettaglioPost}>
                <View style={styles.postTopRow}>
                  <View style={styles.avatar}><Text style={styles.avEmoji}>{postDettaglio?.emoji}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postNome}>{postDettaglio?.nickname}</Text>
                    <Text style={styles.postTempo}>{formatTempo(postDettaglio?.created_at || '')}</Text>
                  </View>
                  <TouchableOpacity onPress={() => segnalaPost(postDettaglio?.id)} style={styles.segnalaBtn}>
                    <Text style={styles.segnalaBtnText}>⚑</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.dettaglioTitolo}>{postDettaglio?.titolo}</Text>
                <Text style={styles.dettaglioTesto}>{postDettaglio?.testo}</Text>
                <TouchableOpacity style={styles.likeRow} onPress={() => toggleLike(postDettaglio?.id, postDettaglio?.likes || 0)}>
                  <Text style={styles.likeEmoji}>{likedPosts.has(postDettaglio?.id) ? '❤️' : '🤍'}</Text>
                  <Text style={styles.likeCount}>{postDettaglio?.likes || 0}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.repliesLbl}>RISPOSTE — {replies.length}</Text>

              {loadingReplies ? <SkeletonCard /> : replies.map(r => (
                <View key={r.id} style={styles.replyCard}>
                  <View style={styles.postTopRow}>
                    <View style={styles.avatarSmall}><Text style={styles.avEmojiSmall}>{r.emoji}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postNome}>{r.nickname}</Text>
                      <Text style={styles.postTempo}>{formatTempo(r.created_at)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRispostaMenzione(r.nickname); }} style={styles.rispondiBtn}>
                      <Text style={styles.rispondiBtnText}>↩</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => segnalaRisposta(r.id)} style={styles.segnalaBtn}>
                      <Text style={styles.segnalaBtnText}>⚑</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.replyTesto}>{r.testo}</Text>
                </View>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}>
              {rispostaMenzione ? (
                <View style={styles.menzioneBar}>
                  <Text style={styles.menzioneText}>↩ @{rispostaMenzione}</Text>
                  <TouchableOpacity onPress={() => setRispostaMenzione('')}>
                    <Text style={styles.menzioneX}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <View style={styles.rispostaBox}>
                <TextInput
                  style={styles.rispostaInput}
                  placeholder="Scrivi una risposta..."
                  placeholderTextColor="#4b5563"
                  value={testoRisposta}
                  onChangeText={setTestoRisposta}
                  multiline
                  onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400)}
                />
                <TouchableOpacity style={styles.rispostaBtn} onPress={inviaRisposta} disabled={invio} activeOpacity={0.8}>
                  <Text style={styles.rispostaBtnText}>{invio ? '...' : '→'}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>

      {/* NUOVO POST */}
      <Modal visible={nuovoPostModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalNuovoBg}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalNuovo}>
                <Text style={styles.modalNuovoTitolo}>Nuovo post</Text>
                {myNickname && (
                  <View style={styles.nicknameRow}>
                    <Text style={styles.nicknameEmoji}>{myNickname.emoji}</Text>
                    <Text style={styles.nicknameNome}>{myNickname.nome}</Text>
                    <Text style={styles.nicknameSub}>· anonimo</Text>
                  </View>
                )}
                <Text style={styles.modalNuovoLbl}>CATEGORIA</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {CATEGORIE.slice(1).map(c => (
                      <TouchableOpacity
                        key={c.value}
                        style={[styles.catPill, categoriaNuova === c.value && { backgroundColor: getCatColore(c.value) + '15', borderColor: getCatColore(c.value) + '40' }]}
                        onPress={() => setCategoriaNuova(c.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.catPillText, categoriaNuova === c.value && { color: getCatColore(c.value) }]}>{c.emoji} {c.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <Text style={styles.modalNuovoLbl}>TITOLO</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Un titolo breve..."
                  placeholderTextColor="#4b5563"
                  value={titoloNuovo}
                  onChangeText={t => setTitoloNuovo(t.slice(0, 100))}
                  returnKeyType="next"
                />
                <Text style={styles.modalNuovoLbl}>MESSAGGIO</Text>
                <TextInput
                  style={[styles.modalInput, { minHeight: 100, textAlignVertical: 'top' }]}
                  placeholder="Scrivi liberamente. Sei anonimo."
                  placeholderTextColor="#4b5563"
                  value={testoNuovo}
                  onChangeText={t => setTestoNuovo(t.slice(0, 500))}
                  multiline
                />
                {testoNuovo.length > 400 && (
                  <Text style={styles.contatore}>{500 - testoNuovo.length} caratteri rimasti</Text>
                )}
                <View style={styles.modalNuovoBtns}>
                  <TouchableOpacity style={styles.modalNuovoCancel} onPress={() => setNuovoPostModal(false)} activeOpacity={0.7}>
                    <Text style={styles.modalNuovoCancelText}>Annulla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalNuovoSave, (!titoloNuovo || !testoNuovo) && { opacity: 0.4 }]}
                    onPress={inviaPost} disabled={invio} activeOpacity={0.8}
                  >
                    <Text style={styles.modalNuovoSaveText}>{invio ? '...' : 'Pubblica'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* LISTA POST */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); caricaPosts(); }} tintColor="#d4a853" colors={['#d4a853']} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topbar}>
          <View>
            <Text style={styles.logoSub}>community</Text>
            <Text style={styles.titolo}>Forum</Text>
          </View>
          <TouchableOpacity style={styles.nuovoBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNuovoPostModal(true); }} activeOpacity={0.8}>
            <Text style={styles.nuovoBtnText}>+ Nuovo</Text>
          </TouchableOpacity>
        </View>

        {myNickname && (
          <View style={styles.anonNote}>
            <Text style={styles.anonText}>{myNickname.emoji}  {myNickname.nome}  ·  anonimo  ·  senza giudizio</Text>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriePill}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20 }}>
            {CATEGORIE.map(c => (
              <TouchableOpacity
                key={c.value}
                style={[styles.catTab, categoriaSelezionata === c.value && { backgroundColor: getCatColore(c.value) + '12', borderColor: getCatColore(c.value) + '35' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategoriaSelezionata(c.value); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.catTabText, categoriaSelezionata === c.value && { color: getCatColore(c.value), fontWeight: '600' }]}>
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
            <Text style={styles.erroreSub}>Tira giù per riprovare</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitolo}>Nessun post ancora</Text>
            <Text style={styles.emptySub}>Sii il primo a scrivere qualcosa.</Text>
          </View>
        ) : (
          posts.map(post => (
            <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => apriPost(post)} activeOpacity={0.85}>
              <View style={styles.postCardTop}>
                <View style={[styles.catBadge, { backgroundColor: getCatColore(post.categoria) + '12', borderColor: getCatColore(post.categoria) + '30' }]}>
                  <Text style={[styles.catBadgeText, { color: getCatColore(post.categoria) }]}>
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
                <View style={styles.postStats}>
                  <TouchableOpacity style={styles.likeRowSmall} onPress={() => toggleLike(post.id, post.likes || 0)}>
                    <Text style={styles.likeEmojiSmall}>{likedPosts.has(post.id) ? '❤️' : '🤍'}</Text>
                    <Text style={styles.likeCountSmall}>{post.likes || 0}</Text>
                  </TouchableOpacity>
                  <Text style={styles.postReplies}>💬 {post.reply_count || 0}</Text>
                </View>
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
  container: { flex: 1, backgroundColor: '#080b12' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 24, paddingTop: 56, paddingBottom: 16 },
  logoSub: { fontSize: 10, color: '#4b5563', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 },
  titolo: { fontSize: 26, fontWeight: '700', color: '#d4a853', letterSpacing: 1 },
  nuovoBtn: { backgroundColor: '#d4a853', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 16 },
  nuovoBtnText: { color: '#080b12', fontSize: 13, fontWeight: '700' },
  anonNote: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 12, padding: 10 },
  anonText: { fontSize: 11, color: '#4b5563', textAlign: 'center', letterSpacing: 0.5 },
  categoriePill: { marginBottom: 14 },
  catTab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030' },
  catTabText: { fontSize: 12, color: '#4b5563' },
  postCard: { marginHorizontal: 20, marginBottom: 10, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 16 },
  postCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  catBadgeText: { fontSize: 10, fontWeight: '600' },
  postTitolo: { fontSize: 15, fontWeight: '700', color: '#f9fafb', marginBottom: 6, lineHeight: 22 },
  postAnteprima: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postAutore: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postAutoreEmoji: { fontSize: 13 },
  postAutoreNome: { fontSize: 11, color: '#4b5563' },
  postStats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  postReplies: { fontSize: 11, color: '#4b5563' },
  postTempo: { fontSize: 10, color: '#4b5563' },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  likeRowSmall: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeEmoji: { fontSize: 18 },
  likeEmojiSmall: { fontSize: 14 },
  likeCount: { fontSize: 13, color: '#6b7280' },
  likeCountSmall: { fontSize: 11, color: '#4b5563' },
  segnalaBtn: { padding: 6 },
  segnalaBtnText: { fontSize: 12, color: '#374151' },
  rispondiBtn: { padding: 6, marginRight: 4 },
  rispondiBtnText: { fontSize: 14, color: '#d4a853' },
  menzioneBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(212,168,83,0.08)', paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(212,168,83,0.15)' },
  menzioneText: { fontSize: 12, color: '#d4a853' },
  menzioneX: { fontSize: 14, color: '#4b5563', padding: 4 },
  empty: { padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitolo: { fontSize: 16, fontWeight: '600', color: '#f9fafb', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#4b5563', textAlign: 'center' },
  erroreBox: { padding: 40, alignItems: 'center' },
  erroreEmoji: { fontSize: 40, marginBottom: 12 },
  erroreTitolo: { fontSize: 16, fontWeight: '600', color: '#f9fafb', marginBottom: 6 },
  erroreSub: { fontSize: 13, color: '#4b5563' },
  skeletonCard: { marginHorizontal: 20, marginBottom: 10, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 16 },
  skeletonTop: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  skeletonAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a2030' },
  skeletonInfo: { flex: 1, gap: 6 },
  skeletonNome: { height: 10, backgroundColor: '#1a2030', borderRadius: 5, width: '40%' },
  skeletonTempo: { height: 8, backgroundColor: '#1a2030', borderRadius: 4, width: '25%' },
  skeletonTitolo: { height: 12, backgroundColor: '#1a2030', borderRadius: 5, width: '80%', marginBottom: 8 },
  skeletonTesto: { height: 10, backgroundColor: '#1a2030', borderRadius: 5, width: '60%' },
  modalDettaglioBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalDettaglio: { flex: 1, backgroundColor: '#080b12', marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  dettaglioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1a2030' },
  dettaglioChiudi: { fontSize: 14, color: '#d4a853', fontWeight: '600' },
  dettaglioScroll: { flex: 1 },
  dettaglioPost: { margin: 16, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 18, padding: 16 },
  postTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(212,168,83,0.12)', alignItems: 'center', justifyContent: 'center' },
  avEmoji: { fontSize: 16 },
  avatarSmall: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  avEmojiSmall: { fontSize: 12 },
  postNome: { fontSize: 12, fontWeight: '600', color: '#f9fafb' },
  dettaglioTitolo: { fontSize: 18, fontWeight: '700', color: '#f9fafb', marginBottom: 10, lineHeight: 26, fontFamily: 'Lora_700Bold' },
  dettaglioTesto: { fontSize: 14, color: '#9ca3af', lineHeight: 22 },
  repliesLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2, marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  replyCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 14, padding: 12 },
  replyTesto: { fontSize: 14, color: '#e5e7eb', lineHeight: 20 },
  rispostaBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#1a2030', backgroundColor: '#0d1117' },
  rispostaInput: { flex: 1, color: '#ffffff', fontSize: 14, minHeight: 40, maxHeight: 100, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, textAlignVertical: 'top' },
  rispostaBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d4a853', alignItems: 'center', justifyContent: 'center' },
  rispostaBtnText: { color: '#080b12', fontSize: 16, fontWeight: '700' },
  modalNuovoBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalNuovo: { backgroundColor: '#0d1117', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalNuovoTitolo: { fontSize: 18, fontWeight: '700', color: '#f9fafb', marginBottom: 12, textAlign: 'center', fontFamily: 'Lora_700Bold' },
  nicknameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, justifyContent: 'center' },
  nicknameEmoji: { fontSize: 16 },
  nicknameNome: { fontSize: 13, fontWeight: '600', color: '#f9fafb' },
  nicknameSub: { fontSize: 11, color: '#4b5563' },
  modalNuovoLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  modalInput: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 14, marginBottom: 14 },
  contatore: { fontSize: 10, color: '#ef4444', textAlign: 'right', marginTop: -10, marginBottom: 10 },
  catPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030' },
  catPillText: { fontSize: 12, color: '#4b5563' },
  modalNuovoBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalNuovoCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center' },
  modalNuovoCancelText: { fontSize: 14, color: '#6b7280' },
  modalNuovoSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#d4a853', alignItems: 'center' },
  modalNuovoSaveText: { fontSize: 14, color: '#080b12', fontWeight: '700' },
  modalRegBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalReg: { backgroundColor: '#0d1117', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalRegTitolo: { fontSize: 20, fontWeight: '700', color: '#f9fafb', textAlign: 'center', marginBottom: 8, fontFamily: 'Lora_700Bold' },
  modalRegSub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  regolaBuona: { backgroundColor: 'rgba(16,185,129,0.06)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)', borderRadius: 14, padding: 14, marginBottom: 10 },
  regolaText: { fontSize: 13, color: '#10b981', marginBottom: 6, lineHeight: 20 },
  regolaVietata: { backgroundColor: 'rgba(239,68,68,0.06)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)', borderRadius: 14, padding: 14, marginBottom: 16 },
  regolaVietataText: { fontSize: 13, color: '#ef4444', marginBottom: 6, lineHeight: 20 },
  regolaNickname: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1a2030', borderRadius: 14, padding: 14, marginBottom: 20, alignItems: 'center' },
  regolaNicknameLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  regolaNicknameVal: { fontSize: 20, fontWeight: '700', color: '#f9fafb', marginBottom: 4 },
  regolaNicknameSub: { fontSize: 11, color: '#4b5563' },
  regBtn: { backgroundColor: '#d4a853', borderRadius: 16, padding: 16, alignItems: 'center' },
  regBtnText: { color: '#080b12', fontSize: 15, fontWeight: '700' },
});