// src/screens/InvoicePreviewScreen.js
import React, { useMemo } from "react";
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

const HELP_BLUE = "#00A6FF";

const currency = (n) =>
  (isNaN(Number(n)) ? 0 : Number(n)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

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

  const html = `
    <html>
    <head>
      <meta
        name="viewport"
        content="width=816, initial-scale=0.45, maximum-scale=0.45, user-scalable=no"
      />
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

        .page {
          width: 816px;
          min-height: 900px;
          background: white;
          padding: 28px;
        }

        h1 { margin:0; font-size:24px; font-weight:800; }
        h2 { margin:0 0 6px 0; font-size:20px; font-weight:700; }
        .meta { font-size:13.5px; color:#4a4a4a; margin:2px 0; }
        .section { margin-top:8px; font-size:12px; font-weight:700; color:#666; }
        .hr { height:1px; background:#e6e6ea; margin:18px 0; }

        .table {
          width:100%;
          border:1px solid #e6e6ea;
          border-collapse: collapse;
          border-radius:12px;
          overflow:hidden;
        }
        .thead { background:#f0f0f3; }
        th {
          text-align:left;
          padding:10px 12px;
          font-size:12px;
          font-weight:700;
          color:#666;
        }

        .pill { font-weight:700; }
        .pillStrong { font-weight:800; }

        .summaryRow {
          display:flex;
          justify-content:space-between;
          margin:4px 0;
          font-size:13.5px;
        }

        /* UPDATED FOOTER (smaller, tighter, cleaner) */
        footer {
          text-align:center;
          margin-top: 220px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        footer .thanks {
          font-size: 13px;       /* smaller like screenshot */
          font-weight: 600;      /* slightly lighter */
          margin-bottom: 4px;    /* tighter spacing */
          color: #333;
        }

        footer .powered {
          font-size: 12px;       /* smaller like screenshot */
          font-weight: 500;      /* lighter + cleaner */
          color: #555;
        }

        footer .brand {
          color: ${HELP_BLUE};   /* KEEP EXACT HELPIO BLUE */
          font-weight: 600;      /* slightly lighter to match screenshot */
        }
      </style>
    </head>

    <body>
      <div class="page">

        <!-- HEADER -->
        <table style="width:100%;">
          <tr>
            <td style="width:82px;vertical-align:top;">${logoImg}</td>
            <td style="padding-left:14px;">
              <h1>${business.name || ""}</h1>
              <div class="meta">${business.line2 || ""}</div>
              <div class="meta">${business.addr1 || ""}</div>
              <div class="meta">${business.addr2 || ""}</div>
              <div class="meta">${business.phone || ""}</div>
              <div class="meta">${business.email || ""}</div>
            </td>
          </tr>
        </table>

        <div class="hr"></div>

        <!-- BILL TO -->
        <table style="width:100%;">
          <tr>
            <td style="width:60%; vertical-align:top;">
              <div class="section">BILL TO</div>
              <h2>${client.name || ""}</h2>
              <div class="meta">${client.addr1 || ""}</div>
              <div class="meta">${client.phone || ""}</div>
              <div class="meta">${client.email || ""}</div>
            </td>

            <td style="width:40%; vertical-align:top;">
              <table style="width:100%;font-size:13.5px;">
                <tr><td>INVOICE</td><td style="text-align:right;">${invoiceMeta.number || ""}</td></tr>
                <tr><td>DUE</td><td style="text-align:right;">${invoiceMeta.due || ""}</td></tr>
                <tr><td>DATE</td><td style="text-align:right;">${invoiceMeta.date || ""}</td></tr>
                <tr>
                  <td style="font-weight:800; padding-top:10px;">BALANCE DUE</td>
                  <td style="text-align:right; font-weight:800;">
                    ${currency(numbers.balance || 0)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- ITEMS -->
        <table class="table" style="margin-top:16px;">
          <thead class="thead">
            <tr>
              <th style="width:50%;">ITEM & DESCRIPTION</th>
              <th style="width:22%;text-align:right;">RATE</th>
              <th style="width:12%;text-align:right;">QTY</th>
              <th style="width:16%;text-align:right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <!-- SUMMARY -->
        <div style="display:flex; justify-content:flex-end; margin-top:24px;">
          <div style="width:260px;">
            <div class="summaryRow"><div>SUBTOTAL</div><div class="pill">${currency(numbers.subtotal || 0)}</div></div>
            <div class="summaryRow"><div>SALES TAX (${taxPct}%)</div><div class="pill">${currency(numbers.tax || 0)}</div></div>
            <div class="summaryRow"><div>TOTAL</div><div class="pill">${currency(numbers.total || 0)}</div></div>
            <div class="summaryRow"><div>PAID</div><div class="pill">${currency(parseFloat(paid) || 0)}</div></div>
            <div class="summaryRow"><div style="font-weight:800;">BALANCE DUE</div><div class="pillStrong">${currency(numbers.balance || 0)}</div></div>
          </div>
        </div>

        <!-- FOOTER -->
        <footer>
          <div class="thanks">Thank you for your business!</div>
          <div class="powered">
            Invoicing System <b>Powered</b> by
            <span class="brand">Helpio BusinessPlace</span> · A Service Marketplace
          </div>
        </footer>

      </div>
    </body>
    </html>
  `;

  return html;
}

export default function InvoicePreviewScreen({ navigation, route }) {
  const { darkMode } = useTheme();
  const params = route?.params || {};
  const html = useMemo(() => buildInvoiceHtml(params), [params]);

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: darkMode ? "#000000" : "#F2F2F7" },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={darkMode ? "#fff" : "#111"}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Preview</Text>
        <View style={{ width: 44 }} />
      </View>

      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  backBtn: {
    width: 44,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
});
