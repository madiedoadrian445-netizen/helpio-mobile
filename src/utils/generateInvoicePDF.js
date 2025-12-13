import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";

const HELP_BLUE = "#00A6FF";

/* ---------------- Utility ---------------- */
const currency = (n) =>
  (isNaN(Number(n)) ? 0 : Number(n)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

/* ---------------- PDF Generator ---------------- */
export async function generateInvoicePDF({
  logoUri,
  business,
  client,
  items,
  numbers,
  taxPct,
  paid,
  invoiceMeta,
}) {
  try {
    // Build item rows with description
    const rowsHtml = items
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

    const logoImg = logoUri
      ? `<img src="${logoUri}" style="width:82px;height:82px;border-radius:14px;object-fit:cover;background:#EEE;" />`
      : `<div style="width:82px;height:82px;border-radius:14px;background:#E9E9E9;display:flex;align-items:center;justify-content:center;font-weight:700;color:#8A8A8A;">LOGO</div>`;

    /* ---------------- HTML Layout ---------------- */
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            body {
              font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Helvetica,Arial,sans-serif;
              color:#0f0f14;
              padding:28px;
              background:#f5f5f7;
              position:relative;
              min-height:100vh;
            }
            h1{margin:0;font-size:24px;font-weight:800;letter-spacing:-0.2px;}
            h2{margin:0 0 6px 0;font-size:20px;font-weight:800;letter-spacing:-0.2px;}
            .meta{color:#494955;font-size:13.5px;margin:2px 0;}
            .section{font-size:12.5px;font-weight:800;color:#6c6c75;margin-top:8px;letter-spacing:0.3px;}
            .hr{height:1px;background:#e6e6ea;margin:18px 0;}
            .table{width:100%;border:1px solid #e6e6ea;border-radius:12px;overflow:hidden;border-collapse:collapse;}
            .thead{background:#f0f0f3;}
            th{font-size:12px;font-weight:800;color:#6c6c75;text-align:left;padding:10px 12px;}
            .summaryRow{display:flex;justify-content:flex-end;gap:10px;padding:6px 0;align-items:center;}
            .label{font-size:13.5px;color:#45454f;}
            .pill{background:#f0f0f3;padding:8px 12px;border-radius:12px;min-width:110px;text-align:right;font-weight:700;}
            .pillStrong{background:#ececf1;padding:10px 14px;border-radius:12px;min-width:130px;text-align:right;font-weight:800;}
            footer{
              position:fixed;
              bottom:32px;
              left:0;
              right:0;
              text-align:center;
              font-size:13px;
              color:#555;
              line-height:1.7;
            }
          </style>
        </head>
        <body>

          <!-- Header -->
          <table style="width:100%;">
            <tr>
              <td style="vertical-align:top;padding-right:12px;">
                <table style="width:100%;">
                  <tr>
                    <td style="width:82px;vertical-align:top;">${logoImg}</td>
                    <td style="vertical-align:top;padding-left:14px;">
                      <h1>${business.name}</h1>
                      <div class="meta">${business.line2}</div>
                      <div class="meta">${business.addr1}</div>
                      <div class="meta">${business.addr2}</div>
                      <div class="meta">${business.phone}</div>
                      <div class="meta">${business.email}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div class="hr"></div>

          <!-- Bill To -->
          <table style="width:100%;">
            <tr>
              <td style="vertical-align:top;width:60%;">
                <div class="section">BILL TO</div>
                <h2>${client.name}</h2>
                <div class="meta">${client.addr1}</div>
                <div class="meta">${client.phone}</div>
                <div class="meta">${client.email}</div>
              </td>
              <td style="vertical-align:top;width:40%;padding-left:10px;">
                <table style="width:100%;">
                  <tr>
                    <td style="font-size:13px;font-weight:800;">INVOICE</td>
                    <td style="font-size:13px;text-align:right;">${invoiceMeta.number}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#555;">DUE</td>
                    <td style="font-size:13px;text-align:right;">${invoiceMeta.due}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#555;">DATE</td>
                    <td style="font-size:13px;text-align:right;">${invoiceMeta.date}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top:10px;">
                      <table style="width:100%;">
                        <tr>
                          <td style="font-size:13px;font-weight:800;">BALANCE DUE</td>
                          <td style="text-align:right;">
                            <div class="pillStrong">${currency(numbers.balance)}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
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

          <!-- Summary -->
          <div style="display:flex;margin-top:24px;gap:16px;">
            <div style="flex:1;"></div>
            <div style="flex:1.2;">
              <div class="summaryRow"><div class="label">SUBTOTAL</div><div class="pill">${currency(numbers.subtotal)}</div></div>
              <div class="summaryRow"><div class="label">SALES TAX (${parseFloat(taxPct) || 0}%)</div><div class="pill">${currency(numbers.tax)}</div></div>
              <div class="summaryRow"><div class="label">TOTAL</div><div class="pill">${currency(numbers.total)}</div></div>
              <div class="summaryRow"><div class="label">PAID</div><div class="pill">${currency(parseFloat(paid) || 0)}</div></div>
              <div class="summaryRow"><div class="label">BALANCE DUE</div><div class="pillStrong">${currency(numbers.balance)}</div></div>
            </div>
          </div>

          <!-- Sticky Footer -->
          <footer>
            <div style="font-weight:600;color:#222;margin-bottom:6px;">Thank you for your business!</div>
            <div>Invoicing System <span style="font-weight:600;">Powered</span> by 
              <span style="color:${HELP_BLUE};font-weight:700;">Helpio BusinessPlace</span> · 
              <span style="color:#666;">A Service Marketplace</span>
            </div>
          </footer>
        </body>
      </html>
    `;

    /* ---------------- Generate PDF ---------------- */
    const { uri: tmpUri } = await Print.printToFileAsync({ html });
    const fileName = `Invoice-${invoiceMeta.number || "Untitled"}.pdf`;
    const destUri = FileSystem.cacheDirectory + fileName;

    try {
      const info = await FileSystem.getInfoAsync(destUri);
      if (info.exists) await FileSystem.deleteAsync(destUri, { idempotent: true });
    } catch {}

    await FileSystem.moveAsync({ from: tmpUri, to: destUri });

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing not available", "Share sheet is not supported.");
      return;
    }

    await Sharing.shareAsync(destUri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: fileName,
    });

    const perm = await MediaLibrary.requestPermissionsAsync();
    if (perm.status === "granted") {
      try {
        const asset = await MediaLibrary.createAssetAsync(destUri);
        await MediaLibrary.createAlbumAsync("Invoices", asset, false);
      } catch {}
    }
  } catch (err) {
    Alert.alert("Error", err?.message || "Failed to generate/share invoice");
  }
}