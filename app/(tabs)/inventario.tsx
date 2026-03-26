import { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useStore, Item, ItemStatus } from '@/store';
import { WMS, statusColor } from '@/constants/theme';
import { Badge, EmptyState } from '@/components/wms/ui';

const FILTROS: { label: string; value: ItemStatus | '' }[] = [
  { label: 'Todos',       value: '' },
  { label: 'Ok',          value: 'ok' },
  { label: 'Pendente',    value: 'pendente' },
  { label: 'Divergência', value: 'divergencia' },
];

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function InventarioScreen() {
  const { state, updateStatus, deleteItem, clearAll } = useStore();
  const [busca,  setBusca]  = useState('');
  const [filtro, setFiltro] = useState<ItemStatus | ''>('');

  const filtered = useMemo(() => state.items.filter(i => {
    const b = !busca || i.codigo.toLowerCase().includes(busca.toLowerCase()) || i.descricao.toLowerCase().includes(busca.toLowerCase());
    const f = !filtro || i.status === filtro;
    return b && f;
  }), [state.items, busca, filtro]);

  function cycleStatus(item: Item) {
    const cycle: ItemStatus[] = ['pendente', 'ok', 'divergencia'];
    updateStatus(item.id, cycle[(cycle.indexOf(item.status) + 1) % cycle.length]);
  }

  function confirmDelete(item: Item) {
    Alert.alert('Remover', `Remover ${item.codigo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteItem(item.id) },
    ]);
  }

  function confirmClear() {
    if (!state.items.length) return;
    Alert.alert('Limpar tudo', 'Remover todos os itens?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: clearAll },
    ]);
  }

  const renderItem = ({ item }: { item: Item }) => (
    <View style={s.row}>
      <View style={s.rowLeft}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge value={item.tipo} type="tipo" />
          <Text style={s.codigo}>{item.codigo}</Text>
        </View>
        {item.descricao   ? <Text style={s.desc}  numberOfLines={1}>{item.descricao}</Text>   : null}
        {item.localizacao ? <Text style={s.local}>📍 {item.localizacao}</Text>                : null}
        <Text style={s.date}>{fmt(item.criadoEm)}</Text>
      </View>
      <View style={s.rowRight}>
        <TouchableOpacity
          onPress={() => cycleStatus(item)}
          style={[s.statusBtn, { backgroundColor: statusColor[item.status].bg, borderColor: statusColor[item.status].border }]}
        >
          <Text style={[s.statusText, { color: statusColor[item.status].text }]}>{item.status}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item)} style={s.delBtn}>
          <Text style={{ color: WMS.red, fontSize: 16, fontWeight: '700' }}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: WMS.bg }}>

      {/* Search bar */}
      <View style={s.searchBar}>
        <TextInput
          style={s.searchInput} value={busca} onChangeText={setBusca}
          placeholder="Buscar código ou descrição..." placeholderTextColor={WMS.muted}
        />
        <TouchableOpacity onPress={confirmClear} style={{ paddingHorizontal: 10 }}>
          <Text style={{ color: WMS.red, fontSize: 12, fontWeight: '600' }}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={s.filterRow}>
        {FILTROS.map(f => (
          <TouchableOpacity key={f.value} onPress={() => setFiltro(f.value)}
            style={[s.chip, filtro === f.value && { borderColor: WMS.teal, backgroundColor: WMS.tealBg }]}>
            <Text style={[s.chipText, filtro === f.value && { color: WMS.teal }]}>
              {f.label} ({f.value ? state.items.filter(i => i.status === f.value).length : state.items.length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: WMS.border }} />}
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title={state.items.length === 0 ? 'Nenhum item' : 'Sem resultados'}
            subtitle={state.items.length === 0 ? 'Registre itens via QR Code ou OCR' : 'Ajuste o filtro ou a busca'}
          />
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: WMS.surface, borderBottomWidth: 1, borderBottomColor: WMS.border },
  searchInput: { flex: 1, backgroundColor: WMS.surface2, borderRadius: 8, borderWidth: 1, borderColor: WMS.border, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: '#ede9e3' },
  filterRow:   { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: WMS.surface, borderBottomWidth: 1, borderBottomColor: WMS.border, flexWrap: 'wrap' },
  chip:        { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: WMS.surface2, borderWidth: 1, borderColor: WMS.border },
  chipText:    { fontSize: 11, color: WMS.muted, fontWeight: '500' },
  row:         { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 14, backgroundColor: WMS.surface },
  rowLeft:     { flex: 1, marginRight: 10 },
  rowRight:    { alignItems: 'flex-end', gap: 8 },
  codigo:      { fontSize: 13, fontWeight: '600', color: '#ede9e3' },
  desc:        { fontSize: 12, color: WMS.muted, marginBottom: 2 },
  local:       { fontSize: 11, color: WMS.muted, marginBottom: 2 },
  date:        { fontSize: 10, color: WMS.muted, marginTop: 2 },
  statusBtn:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  statusText:  { fontSize: 11, fontWeight: '600' },
  delBtn:      { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: WMS.redBg, borderWidth: 1, borderColor: WMS.redBorder },
});