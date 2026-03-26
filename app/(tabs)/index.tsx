import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useStore } from '@/store';
import { WMS } from '@/constants/theme';
import { Card, SectionLabel, StatCard, Badge, EmptyState } from '@/components/wms/ui';

export default function DashboardScreen() {
  const { state } = useStore();
  const { items } = state;

  const total      = items.length;
  const ok         = items.filter(i => i.status === 'ok').length;
  const pendente   = items.filter(i => i.status === 'pendente').length;
  const divergencia= items.filter(i => i.status === 'divergencia').length;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Header */}
      <View style={s.header}>
        <View style={s.dot} />
        <Text style={s.headerTitle}>WMS Mini</Text>
        <Text style={s.headerSub}>{total} iten{total !== 1 ? 's' : ''}</Text>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <StatCard label="total"      value={total} />
        <StatCard label="ok"         value={ok}         color={WMS.teal} />
        <StatCard label="pendente"   value={pendente}   color={WMS.amber} />
        <StatCard label="divergência"value={divergencia}color={WMS.red} />
      </View>

      {/* Recent activity */}
      <Card>
        <SectionLabel>atividade recente</SectionLabel>
        {items.length === 0
          ? <EmptyState icon="📦" title="Nenhuma atividade" subtitle="Registre itens via QR Code ou OCR" />
          : items.slice(0, 10).map(item => (
              <View key={item.id} style={s.actRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Badge value={item.tipo}   type="tipo" />
                  <Text style={s.actCodigo}>{item.codigo}</Text>
                  {item.descricao ? <Text style={s.actDesc} numberOfLines={1}>{item.descricao}</Text> : null}
                </View>
                <Badge value={item.status} type="status" />
              </View>
            ))
        }
      </Card>

      {/* Type split */}
      <Card>
        <SectionLabel>por tipo</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={[s.typeVal, { color: WMS.purple }]}>{items.filter(i => i.tipo === 'qrcode').length}</Text>
            <Text style={s.typeLabel}>QR Code</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.typeVal, { color: WMS.blue }]}>{items.filter(i => i.tipo === 'ocr').length}</Text>
            <Text style={s.typeLabel}>OCR</Text>
          </View>
        </View>
      </Card>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: WMS.bg },
  content:   { padding: 16, paddingBottom: 40 },
  header:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: WMS.teal },
  headerTitle:{ fontSize: 20, fontWeight: '600', color: '#ede9e3' },
  headerSub:  { fontSize: 12, color: WMS.muted, marginLeft: 'auto' },
  actRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: WMS.border },
  actCodigo: { fontSize: 13, fontWeight: '600', color: '#ede9e3' },
  actDesc:   { fontSize: 12, color: WMS.muted, flex: 1 },
  typeVal:   { fontSize: 28, fontWeight: '600' },
  typeLabel: { fontSize: 12, color: WMS.muted, marginTop: 2 },
});