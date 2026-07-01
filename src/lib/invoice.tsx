import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { profile } from "@/data/profile";
import { t, dateLocale, type Lang } from "@/lib/i18n";
import { ORDER_STATUS_LABEL } from "@/lib/payment-config";
import { orderLabel } from "@/lib/utils";

export interface InvoiceOrder {
  id: string;
  orderNumber: number | null;
  serviceTitle: string;
  brief: string;
  status: string;
  agreedTotal: number | null;
  dpAmount: number | null;
  createdAt: Date;
  user: { name: string | null; email: string };
  payments: {
    type: string;
    grossAmount: number;
    paidAt: Date | null;
    transactionStatus: string;
    createdAt: Date;
  }[];
}

// Format aman untuk font bawaan PDF (hindari glyph khusus dari Intl currency).
const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (d: Date, lang: Lang) =>
  new Intl.DateTimeFormat(dateLocale(lang), { dateStyle: "medium" }).format(d);

const ACCENT = "#0f766e";
const INK = "#111827";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";

const st = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: INK, fontFamily: "Helvetica", lineHeight: 1.4 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 15, fontFamily: "Helvetica-Bold", color: INK },
  brandSub: { fontSize: 9, color: MUTED, marginTop: 2 },
  brandContact: { fontSize: 8, color: MUTED, marginTop: 6 },

  invTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: ACCENT, textAlign: "right" },
  invMeta: { fontSize: 9, color: MUTED, textAlign: "right", marginTop: 4 },
  invMetaStrong: { fontSize: 9, color: INK, fontFamily: "Helvetica-Bold" },

  paidBadge: {
    marginTop: 8,
    alignSelf: "flex-end",
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 1,
  },

  rule: { borderBottomWidth: 1, borderBottomColor: LINE, marginVertical: 18 },

  twoCol: { flexDirection: "row", justifyContent: "space-between" },
  colLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  strong: { fontFamily: "Helvetica-Bold", color: INK },

  tableHead: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: LINE,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 22,
  },
  th: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: LINE,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cDesc: { flex: 1, paddingRight: 10 },
  cAmt: { width: 110, textAlign: "right" },
  briefText: { fontSize: 8, color: MUTED, marginTop: 2 },

  summary: { marginTop: 16, alignSelf: "flex-end", width: 240 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  sumLabel: { color: MUTED },
  sumTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: LINE,
  },
  sumTotalLabel: { fontFamily: "Helvetica-Bold", color: INK },
  sumTotalValue: { fontFamily: "Helvetica-Bold", color: ACCENT, fontSize: 12 },

  histHead: { flexDirection: "row", marginTop: 26, borderBottomWidth: 1, borderColor: LINE, paddingBottom: 5 },
  histRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderColor: LINE },
  hDate: { width: 90 },
  hType: { flex: 1 },
  hStatus: { width: 70 },
  hAmt: { width: 90, textAlign: "right" },

  footer: { position: "absolute", bottom: 36, left: 40, right: 40 },
  footThanks: { color: INK, fontFamily: "Helvetica-Bold", fontSize: 10 },
  footNote: { color: MUTED, fontSize: 8, marginTop: 3 },
});

function InvoiceDocument({ order, lang }: { order: InvoiceOrder; lang: Lang }) {
  const tt = t(lang).invoice;
  const total = order.agreedTotal ?? 0;
  const dp = order.dpAmount ?? 0;
  const paidSoFar = order.payments
    .filter((p) => p.paidAt)
    .reduce((sum, p) => sum + p.grossAmount, 0);
  const remaining = Math.max(0, total - paidSoFar);
  const fullyPaid = total > 0 && remaining === 0;
  const statusText = ORDER_STATUS_LABEL[order.status]?.[lang] ?? order.status;

  return (
    <Document
      title={`Invoice ${orderLabel(order)}`}
      author={profile.name}
      subject={order.serviceTitle}
    >
      <Page size="A4" style={st.page}>
        {/* Header */}
        <View style={st.header}>
          <View>
            <Text style={st.brand}>{profile.name}</Text>
            <Text style={st.brandSub}>{profile.title}</Text>
            <Text style={st.brandContact}>{profile.contact.email}</Text>
            <Text style={st.brandContact}>wa.me/{profile.contact.whatsapp}</Text>
          </View>
          <View>
            <Text style={st.invTitle}>{tt.title}</Text>
            <Text style={st.invMeta}>
              {tt.number}: <Text style={st.invMetaStrong}>{orderLabel(order)}</Text>
            </Text>
            <Text style={st.invMeta}>
              {tt.date}: {fmtDate(order.createdAt, lang)}
            </Text>
            {fullyPaid && <Text style={st.paidBadge}>{tt.paidStamp}</Text>}
          </View>
        </View>

        <View style={st.rule} />

        {/* Bill to / status */}
        <View style={st.twoCol}>
          <View>
            <Text style={st.colLabel}>{tt.billTo}</Text>
            <Text style={st.strong}>{order.user.name ?? order.user.email}</Text>
            <Text style={{ color: MUTED }}>{order.user.email}</Text>
          </View>
          <View>
            <Text style={st.colLabel}>{tt.status}</Text>
            <Text style={st.strong}>{statusText}</Text>
          </View>
        </View>

        {/* Line items */}
        <View style={st.tableHead}>
          <Text style={[st.th, st.cDesc]}>{tt.description}</Text>
          <Text style={[st.th, st.cAmt]}>{tt.amount}</Text>
        </View>
        <View style={st.tableRow}>
          <View style={st.cDesc}>
            <Text style={st.strong}>{order.serviceTitle}</Text>
            <Text style={st.briefText}>
              {order.brief.length > 160 ? order.brief.slice(0, 160) + "…" : order.brief}
            </Text>
          </View>
          <Text style={st.cAmt}>{rp(total)}</Text>
        </View>

        {/* Summary */}
        <View style={st.summary}>
          <View style={st.sumRow}>
            <Text style={st.sumLabel}>{tt.agreedTotal}</Text>
            <Text>{rp(total)}</Text>
          </View>
          <View style={st.sumRow}>
            <Text style={st.sumLabel}>{tt.dp}</Text>
            <Text>{rp(dp)}</Text>
          </View>
          <View style={st.sumRow}>
            <Text style={st.sumLabel}>{tt.paidSoFar}</Text>
            <Text>{rp(paidSoFar)}</Text>
          </View>
          <View style={st.sumTotal}>
            <Text style={st.sumTotalLabel}>{tt.remaining}</Text>
            <Text style={st.sumTotalValue}>{rp(remaining)}</Text>
          </View>
        </View>

        {/* Payment history */}
        {order.payments.length > 0 && (
          <View>
            <View style={st.histHead}>
              <Text style={[st.th, st.hDate]}>{tt.colDate}</Text>
              <Text style={[st.th, st.hType]}>{tt.colType}</Text>
              <Text style={[st.th, st.hStatus]}>{tt.colStatus}</Text>
              <Text style={[st.th, st.hAmt]}>{tt.colAmount}</Text>
            </View>
            {order.payments.map((p, i) => (
              <View key={i} style={st.histRow}>
                <Text style={st.hDate}>{fmtDate(p.paidAt ?? p.createdAt, lang)}</Text>
                <Text style={st.hType}>{p.type === "dp" ? tt.typeDp : tt.typeSettlement}</Text>
                <Text style={st.hStatus}>{p.paidAt ? tt.stmtPaid : tt.stmtPending}</Text>
                <Text style={st.hAmt}>{rp(p.grossAmount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={st.footer}>
          <View style={st.rule} />
          <Text style={st.footThanks}>{tt.thanks}</Text>
          <Text style={st.footNote}>{tt.note}</Text>
        </View>
      </Page>
    </Document>
  );
}

/** Render invoice → Buffer PDF. */
export function renderInvoicePdf(order: InvoiceOrder, lang: Lang): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument order={order} lang={lang} />);
}
