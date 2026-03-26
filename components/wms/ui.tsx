import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { WMS, statusColor, tipoColor } from '@/constants/theme';
import { ItemStatus, ItemTipo } from '@/store';

// ─── Badge ────────────────────────────────────────────────────
export function Badge({ value, type }: { value: ItemStatus | ItemTipo; type: 'status' | 'tipo' }) {
  const p = type === 'status' ? statusColor[value as ItemStatus] : tipoColor[value as ItemTipo];
  return (
    <View style={[s.badge, { backgroundColor: p.bg, borderColor: p.border }]}>
      <Text style={[s.badgeText, { color: p.text }]}>{value}</Text>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ─── SectionLabel ─────────────────────────────────────────────
export function SectionLabel({ children }: { children: string }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

// ─── Button ───────────────────────────────────────────────────
type Variant = 'primary' | 'ghost' | 'teal' | 'danger';
interface BtnProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}
export function Btn({ label, onPress, variant = 'ghost', loading, disabled, style, fullWidth }: BtnProps) {
  const vs: ViewStyle =
    variant === 'primary' ? { backgroundColor: '#ede9e3', borderColor: '#ede9e3' } :
    variant === 'teal'    ? { backgroundColor: WMS.tealBg,  borderColor: WMS.tealBorder } :
    variant === 'danger'  ? { backgroundColor: WMS.redBg,   borderColor: WMS.redBorder } :
    { backgroundColor: WMS.surface2, borderColor: WMS.border2 };
  const tc =
    variant === 'primary' ? WMS.bg :
    variant === 'teal'    ? WMS.teal :
    variant === 'danger'  ? WMS.red : '#ede9e3';
  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled || loading}
      style={[s.btn, vs, fullWidth && { width: '100%' }, style, (disabled || loading) && { opacity: 0.4 }]}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator size="small" color={tc} />
        : <Text style={[s.btnText, { color: tc }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ─── StatCard ─────────────────────────────────────────────────
export function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, color ? { color } : {}]}>{String(value)}</Text>
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>{icon}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle && <Text style={s.emptySub}>{subtitle}</Text>}
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────
export function Divider() {
  return <View style={{ height: 1, backgroundColor: WMS.border, marginVertical: 10 }} />;
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, borderWidth: 1, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },

  card: { backgroundColor: WMS.surface, borderRadius: 12, borderWidth: 1, borderColor: WMS.border, padding: 16, marginBottom: 12 },

  sectionLabel: { fontSize: 11, fontWeight: '600', color: WMS.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },

  btn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontWeight: '500' },

  statCard: { flex: 1, backgroundColor: WMS.surface2, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: WMS.border },
  statLabel: { fontSize: 11, color: WMS.muted, marginBottom: 6, letterSpacing: 0.4 },
  statValue: { fontSize: 22, fontWeight: '600', color: '#ede9e3' },

  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '500', color: '#ede9e3', marginBottom: 6, textAlign: 'center' },
  emptySub: { fontSize: 13, color: WMS.muted, textAlign: 'center', lineHeight: 20 },
});