// src/screens/InvoicePreviewScreen.js
import React, { useMemo, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/ThemeContext";
import { api } from "../config/api";

const HELP_BLUE = "#00A6FF";

const currency = (n) =>
  (isNaN(Number(n)) ? 0 : Number(n)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

/* --------------------------------------------------
   HTML BUILDER (UNCHANGED)
-------------------------------------------------- */
function buildInvoiceHtml({
  business = {},
  client = {},
  items = [],
  numbers = {},
  taxPct = "0",
  paid = "0",
  invoiceMeta = {},
}) {
  const rowsHtml = (items || [])
    .map((it) => {
      const r = parseFloat(it.rate) || 0;
      const q = parseFloat(it.qty) || 0;
      const amt = r * q;

      const itemTitle = (it.desc || "-").toString().replace(/</g, "&lt;");
      const itemDesc = it.description
        ? `<div style="font-size:12px;color:#5E5E5E;margin-top:2px;">${it.description
            .toString()
            .replace(/</g, "&lt;")}</div>`
        : "";

      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #ececee;">
            <div style="font-weight:600;">${itemTitle}</div>
            ${itemDesc}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #ececee;text-align:right;">${currency(
            r
          )}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #ececee;text-align:right;">${q}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #ececee;text-align:right;">${currency(
            amt
          )}</td>
        </tr>`;
    })
    .join("");

  const logoImg = business.logoUri
    ? `<img src="${business.logoUri}" style="width:82px;height:82px;border-radius:14px;object-fit:cover;background:#EEE;" />`
    : `<div style="width:82px;height:82px;border-radius:14px;background:#E9E9E9;display:flex;align-items:center;justify-content:center;font-weight:700;color:#8A8A8A;">LOGO</div>`;

  return `
  <html>
  <head>
    <meta name="viewport" content="width=816, initial-scale=0.45, maximum-scale=0.45, user-scalable=no" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #F2F2F7;
        display: flex;
        justify-content: center;
        padding-top: 60px;
        padding-bottom: 60px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .page { width: 816px; background: white; padding: 28px; }
      h1 { margin:0; font-size:24px; font-weight:800; }
      h2 { margin:0 0 6px 0; font-size:20px; font-weight:700; }
      .meta { font-size:13.5px; color:#4a4a4a; margin:2px 0; }
      .section { margin-top:8px; font-size:12px; font-weight:700; color:#666; }
      .hr { height:1px; background:#e6e6ea; margin:18px 0; }
      .table { width:100%; border:1px solid #e6e6ea; border-collapse: collapse; }
      .thead { background:#f0f0f3; }
      th { padding:10px 12px; font-size:12px; font-weight:700; color:#666; }
      .summaryRow { display:flex; justify-content:space-between; margin:4px 0; font-size:13.5px; }
      footer { text-align:center; margin-top:220px; }
      footer .brand { color:${HELP_BLUE}; font-weight:600; }
    </style>
  </head>

  <body>
    <div class="page">
      <table style="width:100%;">
        <tr>
          <td style="width:82px;">${logoImg}</td>
          <td style="padding-left:14px;">
            <h1>${business.name || ""}</h1>
            <div class="meta">${business.addr1 || ""}</div>
            <div class="meta">${business.phone || ""}</div>
            <div class="meta">${business.email || ""}</div>
          </td>
        </tr>
      </table>

      <div class="hr"></div>

      <h2>${client.name || ""}</h2>

      <table class="table">
        <thead class="thead">
          <tr>
            <th>ITEM</th>
            <th style="text-align:right;">RATE</th>
            <th style="text-align:right;">QTY</th>
            <th style="text-align:right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div style="margin-top:20px;">
        <div class="summaryRow"><div>TOTAL</div><div>${currency(numbers.total || 0)}</div></div>
        <div class="summaryRow"><div>PAID</div><div>${currency(paid || 0)}</div></div>
        <div class="summaryRow"><b>BALANCE</b><b>${currency(numbers.balance || 0)}</b></div>
      </div>

      <footer>
        Powered by <span class="brand">Helpio BusinessPlace</span>
      </footer>
    </div>
  </body>
  </html>
  `;
}

/* --------------------------------------------------
   SCREEN
-------------------------------------------------- */
export default function InvoicePreviewScreen({ navigation, route }) {
  const { darkMode } = useTheme();

  const routeParams = route?.params || {};
  const invoiceId = routeParams.invoiceId;

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(!!invoiceId);

  useEffect(() => {
    if (!invoiceId) return;

    const loadInvoice = async () => {
  try {
    const res = await api.get(`/api/invoices/${invoiceId}`);
    const invoice = res.data.invoice;

        setInvoiceData({
          business: invoice.providerSnapshot || {},
          client: invoice.customerSnapshot || {},
          items: invoice.items || [],
          numbers: {
            subtotal: invoice.subtotal,
            tax: invoice.taxAmount,
            total: invoice.total,
            balance: invoice.balanceDue,
          },
          taxPct: invoice.taxRate || 0,
          paid: invoice.amountPaid || 0,
          invoiceMeta: {
            number: invoice.invoiceNumber,
            date: invoice.issueDate,
            due: invoice.dueDate,
          },
        });
      } catch (e) {
        console.error("❌ Failed to load invoice", e);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId]);

  const previewParams = invoiceId ? invoiceData : routeParams;

  const html = useMemo(() => {
  if (!previewParams) return "<html></html>";
  return buildInvoiceHtml(previewParams);
}, [previewParams]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          Loading invoice…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Preview</Text>
        <View style={{ width: 22 }} />
      </View>

      <WebView originWhitelist={["*"]} source={{ html }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
});
