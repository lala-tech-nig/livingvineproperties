'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileImage, Award, Printer, X, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

function formatCurrency(amount) {
    return `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getMaturityDate(investment) {
    if (!investment.startDate || !investment.durationInMonths) return null;
    const d = new Date(investment.startDate);
    d.setMonth(d.getMonth() + investment.durationInMonths);
    return d;
}

// Convert numbers to currency in words
function toNairaWords(amount) {
    const num = Math.floor(amount);
    if (num === 0) return "ZERO NAIRA ONLY";
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const scales = ["", "Thousand", "Million", "Billion", "Trillion"];
    
    function convertSection(n) {
        let str = "";
        if (n >= 100) {
            str += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n > 0) {
            str += ones[n] + " ";
        }
        return str;
    }
    
    let parts = [];
    let scaleIndex = 0;
    let temp = num;
    
    while (temp > 0) {
        let section = temp % 1000;
        if (section > 0) {
            let sectionStr = convertSection(section).trim();
            if (scaleIndex > 0) {
                sectionStr += " " + scales[scaleIndex];
            }
            parts.unshift(sectionStr);
        }
        temp = Math.floor(temp / 1000);
        scaleIndex++;
    }
    
    return (parts.join(" ").replace(/\s+/g, " ").trim() + " NAIRA ONLY").toUpperCase();
}

// ── Generate high-fidelity Payment Receipt HTML ────────────────────
function generateReceiptHTML(investment, settings = {}) {
    const receiptNo = `LVP-${investment._id?.slice(-6).toUpperCase() || 'XXXXXX'}`;
    const today = formatDate(new Date());
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoUrl = `${origin}/living-logo.png`;
    const amountInWords = toNairaWords(investment.amountToInvest || 0);

    const signeeName = settings.receiptSigneeName || 'AUTHORIZED SIGNATORY';
    const signeePosition = settings.receiptSigneePosition || 'Authorized Signature';
    const signatureImage = settings.receiptSigneeSignature 
        ? `<img src="${settings.receiptSigneeSignature}" alt="Signature" class="signature-img" />`
        : '<div class="signature-line"></div>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Receipt — ${receiptNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', sans-serif; background: #fafafa; color: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 1000px; min-height: 700px; background: white; margin: 20px auto; position: relative; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border-radius: 12px; }
    
    /* Header section */
    .header-banner { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #b0181d; padding-bottom: 20px; margin-bottom: 24px; position: relative; }
    .brand-section { display: flex; align-items: center; gap: 15px; }
    .brand-logo { height: 65px; width: auto; object-contain; }
    .brand-info { display: flex; flex-direction: column; }
    .brand-name { font-size: 22px; font-weight: 900; color: #b0181d; letter-spacing: -0.5px; line-height: 1.1; }
    .brand-legal { font-size: 20px; font-weight: 800; color: #111; letter-spacing: -0.5px; margin-top: 2px; }
    .brand-tagline { font-size: 11px; font-style: italic; color: #666; font-weight: 500; margin-top: 4px; }
    
    .receipt-title-box { text-align: right; }
    .receipt-header-title { font-size: 26px; font-weight: 900; color: #white; background: #b0181d; padding: 12px 35px; border-radius: 6px; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 12px rgba(176,24,29,0.15); color: white; }
    .receipt-header-line { height: 3px; background: #d4af37; width: 60px; margin-left: auto; margin-top: 8px; }

    /* Metadata grids */
    .content-box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background: #fff; margin-bottom: 24px; }
    .meta-grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 30px; align-items: start; }
    .meta-col { display: flex; flex-direction: column; gap: 14px; }
    
    .section-lbl { font-size: 11px; font-weight: 800; color: #b0181d; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1.5px solid #f3f4f6; padding-bottom: 6px; margin-bottom: 8px; }
    .info-row { display: flex; font-size: 12px; margin-bottom: 6px; line-height: 1.4; }
    .info-lbl { font-weight: 700; color: #666; width: 80px; shrink: 0; }
    .info-val { color: #111; font-weight: 600; flex: 1; }
    
    /* Highlight badge box */
    .badge-box { background: #fafafa; border: 1.5px dashed #d4af37; border-radius: 10px; padding: 15px; text-align: center; }
    .badge-lbl { font-size: 10px; color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .badge-val { font-size: 14px; font-weight: 800; color: #b0181d; }
    
    /* Data table styling */
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 8px; overflow: hidden; border: 1.5px solid #b0181d; }
    .data-table th { background: #b0181d; color: white; padding: 12px 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
    .data-table th:last-child { text-align: right; }
    .data-table td { padding: 22px 20px; font-size: 13px; font-weight: 600; color: #222; background: #fff; }
    .data-table td:last-child { text-align: right; font-size: 18px; font-weight: 900; color: #b0181d; border-left: 1.5px solid #e5e7eb; width: 250px; }
    
    /* Total In Words */
    .words-box { display: flex; align-items: center; gap: 12px; background: #fff8f8; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 18px; margin-bottom: 24px; }
    .words-icon { width: 22px; height: 22px; border-radius: 50%; bg-color: #b0181d; background: #b0181d; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 900; }
    .words-label { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; }
    .words-value { font-size: 12px; font-weight: 800; color: #b0181d; }
    
    /* Signatures bottom */
    .bottom-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding: 0 10px; }
    .thanks-section { display: flex; flex-direction: column; gap: 4px; }
    .thanks-title { font-family: Georgia, serif; font-size: 24px; font-style: italic; font-weight: bold; color: #b0181d; }
    .thanks-sub { font-size: 12px; color: #666; font-weight: 600; }
    
    .sig-section { text-align: center; width: 220px; position: relative; }
    .signature-container { height: 60px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px; }
    .signature-img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .signature-line { width: 100%; height: 1.5px; background: #bbb; }
    .sig-label { font-size: 11px; font-weight: 700; color: #111; margin-bottom: 2px; }
    .sig-title { font-size: 10px; font-weight: 600; color: #777; }
    
    /* Red footer bar */
    .footer-bar { background: #b0181d; color: white; padding: 15px 25px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 600; margin-top: 30px; box-shadow: 0 4px 15px rgba(176,24,29,0.15); border-bottom: 3.5px solid #d4af37; }
    .footer-col { display: flex; align-items: center; gap: 8px; }
    .footer-icon { font-size: 13px; opacity: 0.85; }
    
    .tagline-row { text-align: center; font-size: 9px; font-weight: 800; text-transform: uppercase; color: #d4af37; letter-spacing: 4px; margin-top: 15px; }

    @media print {
      body { background: white; }
      .page { box-shadow: none; margin: 0; padding: 20px; width: 100%; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header-banner">
    <div class="brand-section">
      <img src="${logoUrl}" alt="LVP Logo" class="brand-logo" onerror="this.style.display='none'" />
      <div class="brand-info">
        <div class="brand-name">LIVING VINE PROPERTIES INVESTMENT LIMITED</div>
        <div class="brand-tagline">Building Wealth. Securing Futures.</div>
      </div>
    </div>
    <div class="receipt-title-box">
      <div class="receipt-header-title">PAYMENT RECEIPT</div>
      <div class="receipt-header-line"></div>
    </div>
  </div>

  <div class="content-box meta-grid">
    <div class="meta-col">
      <div class="section-lbl">Received From:</div>
      <div class="info-row">
        <span class="info-lbl">Name:</span>
        <span class="info-val">${investment.name || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Phone:</span>
        <span class="info-val">${investment.phoneNumber || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Address:</span>
        <span class="info-val">${investment.contactAddress || '—'}</span>
      </div>
    </div>
    
    <div class="meta-col">
      <div class="section-lbl">Payment Summary:</div>
      <div class="info-row">
        <span class="info-lbl">Total Paid:</span>
        <span class="info-val">${formatCurrency(investment.amountToInvest)}</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Method:</span>
        <span class="info-val">Bank Transfer</span>
      </div>
      <div class="info-row">
        <span class="info-lbl">Tx ID:</span>
        <span class="info-val">${investment._id?.slice(-8).toUpperCase() || '—'}</span>
      </div>
    </div>

    <div class="meta-col" style="gap: 10px;">
      <div class="badge-box">
        <div class="badge-lbl">Receipt No:</div>
        <div class="badge-val" style="color: #b0181d;">PR: ${investment.startDate ? new Date(investment.startDate).getMonth() + 1 : '01'}/${investment._id?.slice(-3).toUpperCase() || '001'}</div>
      </div>
      <div class="badge-box" style="border-color: #e5e7eb;">
        <div class="badge-lbl">Date Issued:</div>
        <div class="badge-val" style="color: #111; font-size: 12px;">${investment.startDate ? formatDate(investment.startDate) : today}</div>
      </div>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          ${investment.productName ? `<strong>${investment.productName}</strong> — ` : ''}Being Payment for ${investment.durationInMonths || '12'} Month Investment Subscription 
          at the rate of ${investment.roiPercent || '24'}% Return on Investment
        </td>
        <td>${formatCurrency(investment.amountToInvest)}</td>
      </tr>
    </tbody>
  </table>

  <div class="words-box">
    <div class="words-icon">₦</div>
    <div class="words-label">Amount in Words:</div>
    <div class="words-value">${amountInWords}</div>
  </div>

  <div class="bottom-row">
    <div class="thanks-section">
      <div class="thanks-title">Thank You!</div>
      <div class="thanks-sub">Thank you for investing with us.</div>
    </div>
    
    <div class="sig-section">
      <div class="signature-container">
        ${signatureImage}
      </div>
      <div class="sig-label">${signeeName}</div>
      <div class="sig-title">${signeePosition}</div>
    </div>
  </div>

  <div class="footer-bar">
    <div class="footer-col">
      <span class="footer-icon">📞</span>
      <span>+234 707 474 4676, 0707 474 4677</span>
    </div>
    <div class="footer-col">
      <span class="footer-icon">🌐</span>
      <span>www.livingvineproperties.com.ng</span>
    </div>
    <div class="footer-col">
      <span class="footer-icon">✉️</span>
      <span>info@livingvineproperties.com.ng</span>
    </div>
    <div class="footer-col" style="max-width: 250px; text-align: right;">
      <span class="footer-icon">📍</span>
      <span>14, Fadare Street, Off Kayode Street, Ogba, Ikeja, Lagos</span>
    </div>
  </div>
  
  <div class="tagline-row">
    BUILD WEALTH &bull; SECURE FUTURES &bull; LIVE BETTER
  </div>
</div>
</body>
</html>`;
}

// ── Generate high-fidelity Premium Investment Certificate HTML ──────────────────
function generateCertificateHTML(investment, settings = {}) {
    const maturity = getMaturityDate(investment);
    const certNo = `LVP/${investment.startDate ? new Date(investment.startDate).getFullYear() : new Date().getFullYear()}/${investment._id?.slice(-6).toUpperCase() || '000001'}`;
    const issuedDate = formatDate(investment.startDate ? new Date(investment.startDate) : new Date());
    const maturityDate = maturity ? formatDate(maturity) : '—';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoUrl = `${origin}/living-logo.png`;
    const amountInWords = toNairaWords(investment.amountToInvest || 0);
    const planName = investment.productName || `${investment.durationInMonths || 12}-Month Investment Plan`;
    const roiPct = investment.roiPercent || 24;
    const duration = investment.durationInMonths || 12;

    const sigLeftName    = settings.certSigneeLeftName     || 'AUTHORIZED SIGNATORY';
    const sigLeftPos     = settings.certSigneeLeftPosition || 'Admin Manager';
    const sigRightName   = settings.certSigneeRightName    || 'AUTHORIZED SIGNATORY';
    const sigRightPos    = settings.certSigneeRightPosition|| 'Business Development Manager';

    const sigLeftImageHtml = settings.certSigneeLeftSignature
        ? `<img src="${settings.certSigneeLeftSignature}" alt="${sigLeftName} signature" style="max-height:52px;max-width:160px;object-fit:contain;" />`
        : `<div style="width:160px;height:1.5px;background:#b8a060;margin:0 auto;"></div>`;

    const sigRightImageHtml = settings.certSigneeRightSignature
        ? `<img src="${settings.certSigneeRightSignature}" alt="${sigRightName} signature" style="max-height:52px;max-width:160px;object-fit:contain;" />`
        : `<div style="width:160px;height:1.5px;background:#b8a060;margin:0 auto;"></div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Investment Certificate — ${certNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;800;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; }
    body {
      font-family: 'Montserrat', sans-serif;
      background: #e8e0cc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Page Canvas ── */
    .page {
      width: 1050px;
      min-height: 780px;
      margin: 24px auto;
      background: #fdfaf2;
      background-image:
        radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 70%, rgba(176,24,29,0.05) 0%, transparent 55%);
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 4px 15px rgba(0,0,0,0.15);
    }

    /* ── Layered Ornate Borders ── */
    .border-layer-1 {
      position: absolute; inset: 0;
      border: 18px solid #7d1419;
      pointer-events: none; z-index: 5;
    }
    .border-layer-2 {
      position: absolute; inset: 18px;
      border: 2.5px solid #c9a84c;
      pointer-events: none; z-index: 5;
    }
    .border-layer-3 {
      position: absolute; inset: 24px;
      border: 0.8px solid #c9a84c;
      pointer-events: none; z-index: 5;
      opacity: 0.5;
    }
    /* Guilloche-style side pattern lines */
    .border-layer-1::before {
      content: '';
      position: absolute;
      inset: 3px;
      border: 1px solid rgba(201,168,76,0.35);
      pointer-events: none;
    }

    /* ── Corner Ornaments ── */
    .corner {
      position: absolute; width: 60px; height: 60px;
      z-index: 10; pointer-events: none;
    }
    .corner-tl { top: 6px; left: 6px; }
    .corner-tr { top: 6px; right: 6px; transform: scaleX(-1); }
    .corner-bl { bottom: 6px; left: 6px; transform: scaleY(-1); }
    .corner-br { bottom: 6px; right: 6px; transform: scale(-1,-1); }

    /* ── Background Watermark Seal ── */
    .watermark-seal {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 340px; height: 340px;
      opacity: 0.045;
      pointer-events: none;
      z-index: 1;
    }

    /* ── Burgundy Header Banner ── */
    .cert-header {
      position: relative; z-index: 15;
      background: linear-gradient(135deg, #5c0e12 0%, #8b1a1f 40%, #7d1419 60%, #5c0e12 100%);
      padding: 22px 45px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #c9a84c;
    }
    .cert-header::after {
      content: '';
      position: absolute; bottom: -6px; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9a84c 20%, #c9a84c 80%, transparent);
    }

    .header-brand { display: flex; align-items: center; gap: 16px; }
    .header-logo { height: 56px; width: auto; object-fit: contain; filter: brightness(0) invert(1); }
    .header-text { display: flex; flex-direction: column; }
    .header-org-name {
      font-family: 'Cinzel', serif;
      font-size: 13.5px; font-weight: 900;
      color: #fff; letter-spacing: 1px; line-height: 1.2;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .header-rc {
      font-size: 9px; font-weight: 700;
      color: rgba(255,255,255,0.6);
      letter-spacing: 1.5px; margin-top: 2px;
      text-transform: uppercase;
    }
    .header-tagline {
      font-size: 8.5px; font-style: italic;
      color: #c9a84c; margin-top: 3px;
      font-family: 'EB Garamond', serif;
      letter-spacing: 0.5px;
    }

    /* ── Cert Number Badge ── */
    .cert-badge {
      text-align: right;
    }
    .cert-badge-label {
      font-size: 7.5px; font-weight: 800;
      color: rgba(255,255,255,0.55);
      letter-spacing: 2px; text-transform: uppercase;
      margin-bottom: 3px;
    }
    .cert-badge-no {
      font-family: 'Cinzel', serif;
      font-size: 11px; font-weight: 700;
      color: #c9a84c;
      letter-spacing: 1.5px;
      background: rgba(0,0,0,0.25);
      padding: 5px 14px;
      border: 1px solid rgba(201,168,76,0.4);
      border-radius: 4px;
      display: inline-block;
    }

    /* ── Gold Ribbon Divider ── */
    .gold-ribbon {
      position: relative; z-index: 15;
      height: 6px;
      background: linear-gradient(90deg, #5c0e12 0%, #c9a84c 20%, #f0d080 50%, #c9a84c 80%, #5c0e12 100%);
      margin-bottom: 0;
    }

    /* ── Body ── */
    .cert-body {
      position: relative; z-index: 15;
      padding: 30px 60px 22px;
      text-align: center;
    }

    /* ── CERTIFICATE OF INVESTMENT Title ── */
    .cert-main-title {
      font-family: 'Cinzel Decorative', serif;
      font-size: 38px; font-weight: 900;
      color: #7d1419;
      letter-spacing: 4px;
      line-height: 1.1;
      text-shadow: 2px 2px 0 rgba(125,20,25,0.12);
      margin-bottom: 2px;
    }
    .cert-sub-heading {
      font-family: 'Cinzel', serif;
      font-size: 11px; font-weight: 700;
      color: #c9a84c;
      letter-spacing: 8px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }

    /* ── Ornate Divider ── */
    .ornate-divider {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; margin: 10px 0 14px;
    }
    .od-line { flex: 1; max-width: 100px; height: 1px; background: linear-gradient(90deg, transparent, #c9a84c); }
    .od-line.right { background: linear-gradient(90deg, #c9a84c, transparent); }
    .od-diamond { width: 7px; height: 7px; background: #c9a84c; transform: rotate(45deg); }
    .od-diamond-sm { width: 4px; height: 4px; background: #c9a84c; transform: rotate(45deg); opacity: 0.6; }
    .od-center-ornament {
      font-size: 18px; color: #c9a84c; line-height: 1;
    }

    /* ── Presented To ── */
    .presented-label {
      font-family: 'EB Garamond', serif;
      font-size: 12px; font-style: italic;
      color: #888; letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    /* ── Investor Name ── */
    .investor-name-row {
      display: flex; align-items: center; justify-content: center; gap: 18px;
      margin-bottom: 14px;
    }
    .name-bar { height: 2px; width: 80px; background: linear-gradient(90deg, transparent, #c9a84c); }
    .name-bar.right { background: linear-gradient(90deg, #c9a84c, transparent); }
    .name-gem { width: 8px; height: 8px; background: #c9a84c; transform: rotate(45deg); box-shadow: 0 0 6px rgba(201,168,76,0.5); }
    .investor-name {
      font-family: 'Cinzel', serif;
      font-size: 28px; font-weight: 900;
      color: #1a0a0a;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.08);
    }

    /* ── Declaration Text ── */
    .declaration {
      font-family: 'EB Garamond', serif;
      font-size: 14px;
      color: #3a2a2a;
      line-height: 1.9;
      max-width: 760px;
      margin: 0 auto 18px;
      letter-spacing: 0.3px;
    }
    .decl-highlight {
      font-family: 'Cinzel', serif;
      font-size: 14px; font-weight: 700;
      color: #7d1419;
    }

    /* ── Investment Details Table ── */
    .details-table {
      max-width: 760px; margin: 0 auto 20px;
      border: 1.5px solid #c9a84c;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(201,168,76,0.15);
    }
    .details-table table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-table th {
      background: linear-gradient(135deg, #5c0e12, #7d1419);
      color: #c9a84c;
      font-family: 'Cinzel', serif;
      font-size: 7.5px; font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 8px 16px;
      text-align: left;
    }
    .details-table td {
      padding: 9px 16px;
      font-size: 11px; font-weight: 600;
      color: #2a1a1a;
      border-bottom: 1px solid rgba(201,168,76,0.2);
      background: rgba(255,255,255,0.7);
    }
    .details-table td:first-child {
      font-weight: 700; color: #7d1419;
      width: 200px; font-size: 9.5px;
      letter-spacing: 0.8px; text-transform: uppercase;
      font-family: 'Montserrat', sans-serif;
      border-right: 1px solid rgba(201,168,76,0.2);
    }
    .details-table tr:last-child td { border-bottom: none; }
    .details-table tr:nth-child(even) td { background: rgba(253,250,242,0.9); }
    .amount-val {
      font-family: 'Cinzel', serif;
      font-size: 14px; font-weight: 900;
      color: #7d1419;
    }

    /* ── Signatures ── */
    .signatures-section {
      position: relative; z-index: 15;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 70px 24px;
      margin-top: 4px;
    }
    .sig-block {
      text-align: center;
      min-width: 200px;
    }
    .sig-image-zone {
      height: 58px;
      display: flex; align-items: flex-end; justify-content: center;
      margin-bottom: 6px;
    }
    .sig-underline {
      width: 180px; height: 1.5px;
      background: linear-gradient(90deg, transparent 5%, #b8a060 30%, #b8a060 70%, transparent 95%);
      margin: 0 auto 5px;
    }
    .sig-name {
      font-family: 'Cinzel', serif;
      font-size: 9.5px; font-weight: 800;
      color: #1a0a0a;
      letter-spacing: 1px; text-transform: uppercase;
      margin-bottom: 2px;
    }
    .sig-role {
      font-size: 8px; font-weight: 700;
      color: #7d1419;
      letter-spacing: 1px; text-transform: uppercase;
    }
    .sig-center-seal {
      text-align: center;
      flex: 1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 5px;
      padding-bottom: 8px;
    }
    .seal-logo {
      width: 52px; height: 52px; object-fit: contain;
      opacity: 0.9;
    }
    .seal-rc {
      font-size: 7px; font-weight: 900;
      background: #1a0a0a; color: #c9a84c;
      padding: 2px 8px; border-radius: 3px;
      letter-spacing: 1px;
    }
    .seal-motto {
      font-family: 'EB Garamond', serif;
      font-size: 8px; font-style: italic;
      color: #888;
    }

    /* ── Gold Footer Strip ── */
    .cert-footer {
      position: relative; z-index: 15;
      background: linear-gradient(135deg, #5c0e12, #7d1419);
      border-top: 3px solid #c9a84c;
      padding: 10px 45px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-left {
      font-size: 8px; color: rgba(255,255,255,0.65);
      font-weight: 600; letter-spacing: 0.5px;
    }
    .footer-center {
      font-family: 'Cinzel', serif;
      font-size: 8px; font-weight: 800;
      color: #c9a84c;
      letter-spacing: 3px; text-transform: uppercase;
    }
    .footer-right {
      font-size: 8px; color: rgba(255,255,255,0.65);
      font-weight: 600; letter-spacing: 0.5px; text-align: right;
    }

    @media print {
      body { background: white; }
      .page { box-shadow: none; margin: 0; width: 100%; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Watermark Seal -->
  <svg class="watermark-seal" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,5 120,60 180,60 132,95 152,150 100,118 48,150 68,95 20,60 80,60" fill="#7d1419"/>
    <circle cx="100" cy="100" r="55" fill="none" stroke="#7d1419" stroke-width="3"/>
    <circle cx="100" cy="100" r="48" fill="none" stroke="#7d1419" stroke-width="1"/>
    <text x="100" y="93" text-anchor="middle" font-family="serif" font-size="10" font-weight="bold" fill="#7d1419" letter-spacing="2">LIVING VINE</text>
    <text x="100" y="107" text-anchor="middle" font-family="serif" font-size="8" fill="#7d1419" letter-spacing="1">PROPERTIES</text>
    <text x="100" y="118" text-anchor="middle" font-family="serif" font-size="7" fill="#7d1419">INVESTMENT LTD</text>
  </svg>

  <!-- Multi-layer borders -->
  <div class="border-layer-1"></div>
  <div class="border-layer-2"></div>
  <div class="border-layer-3"></div>

  <!-- Corner Ornaments (SVG) -->
  <svg class="corner corner-tl" viewBox="0 0 60 60" fill="none">
    <path d="M2 2 L20 2 L2 20 Z" fill="#7d1419" opacity="0.4"/>
    <path d="M2 2 L50 2" stroke="#c9a84c" stroke-width="2"/>
    <path d="M2 2 L2 50" stroke="#c9a84c" stroke-width="2"/>
    <path d="M8 8 L36 8" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
    <path d="M8 8 L8 36" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
    <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
    <polygon points="18,2 22,2 20,6" fill="#c9a84c" opacity="0.7"/>
    <polygon points="2,18 2,22 6,20" fill="#c9a84c" opacity="0.7"/>
  </svg>
  <svg class="corner corner-tr" viewBox="0 0 60 60" fill="none">
    <path d="M2 2 L20 2 L2 20 Z" fill="#7d1419" opacity="0.4"/>
    <path d="M2 2 L50 2" stroke="#c9a84c" stroke-width="2"/>
    <path d="M2 2 L2 50" stroke="#c9a84c" stroke-width="2"/>
    <path d="M8 8 L36 8" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
    <path d="M8 8 L8 36" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
    <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
  </svg>
  <svg class="corner corner-bl" viewBox="0 0 60 60" fill="none">
    <path d="M2 2 L20 2 L2 20 Z" fill="#7d1419" opacity="0.4"/>
    <path d="M2 2 L50 2" stroke="#c9a84c" stroke-width="2"/>
    <path d="M2 2 L2 50" stroke="#c9a84c" stroke-width="2"/>
    <path d="M8 8 L36 8" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
    <path d="M8 8 L8 36" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
    <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
  </svg>
  <svg class="corner corner-br" viewBox="0 0 60 60" fill="none">
    <path d="M2 2 L20 2 L2 20 Z" fill="#7d1419" opacity="0.4"/>
    <path d="M2 2 L50 2" stroke="#c9a84c" stroke-width="2"/>
    <path d="M2 2 L2 50" stroke="#c9a84c" stroke-width="2"/>
    <path d="M8 8 L36 8" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
    <path d="M8 8 L8 36" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
    <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
  </svg>

  <!-- Header Banner -->
  <div class="cert-header">
    <div class="header-brand">
      <img src="${logoUrl}" alt="LVP Logo" class="header-logo" onerror="this.style.display='none'" />
      <div class="header-text">
        <div class="header-org-name">LIVING VINE PROPERTIES INVESTMENT LIMITED</div>
        <div class="header-rc">RC NO: 773931 &nbsp;|&nbsp; CAC REGISTERED</div>
        <div class="header-tagline">Building Wealth. Securing Futures. Transforming Lives.</div>
      </div>
    </div>
    <div class="cert-badge">
      <div class="cert-badge-label">Certificate No.</div>
      <div class="cert-badge-no">${certNo}</div>
    </div>
  </div>

  <!-- Gold Ribbon -->
  <div class="gold-ribbon"></div>

  <!-- Body -->
  <div class="cert-body">

    <div class="cert-main-title">Certificate</div>
    <div class="cert-sub-heading">of Investment</div>

    <!-- Ornate Divider -->
    <div class="ornate-divider">
      <div class="od-line"></div>
      <div class="od-diamond-sm"></div>
      <div class="od-diamond"></div>
      <div class="od-center-ornament">✦</div>
      <div class="od-diamond"></div>
      <div class="od-diamond-sm"></div>
      <div class="od-line right"></div>
    </div>

    <div class="presented-label">This Certificate is Proudly Presented To</div>

    <div class="investor-name-row">
      <div class="name-bar"></div>
      <div class="name-gem"></div>
      <div class="investor-name">${investment.name || '—'}</div>
      <div class="name-gem"></div>
      <div class="name-bar right"></div>
    </div>

    <div class="declaration">
      In recognition of your trust, commitment, and investment of
      <span class="decl-highlight">${formatCurrency(investment.amountToInvest)}</span>
      (${amountInWords})
      under the <span class="decl-highlight">${planName.toUpperCase()}</span>,
      for a tenure of <span class="decl-highlight">${duration} Months</span>
      at a guaranteed return of <span class="decl-highlight">${roiPct}% per annum</span>.
      This certificate serves as official acknowledgment of your participation in LIVING VINE PROPERTIES INVESTMENT LIMITED.
    </div>

    <!-- Investment Details Grid -->
    <div class="details-table">
      <table>
        <thead>
          <tr>
            <th colspan="2">Investment Summary &amp; Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Investor Name</td>
            <td>${investment.name || '—'}</td>
          </tr>
          <tr>
            <td>Investment Plan</td>
            <td>${planName}</td>
          </tr>
          <tr>
            <td>Principal Amount</td>
            <td><span class="amount-val">${formatCurrency(investment.amountToInvest)}</span></td>
          </tr>
          <tr>
            <td>Return on Investment</td>
            <td>${roiPct}% &nbsp;—&nbsp; Expected Return: ${formatCurrency((investment.amountToInvest || 0) * roiPct / 100)}</td>
          </tr>
          <tr>
            <td>Tenure / Duration</td>
            <td>${duration} Months</td>
          </tr>
          <tr>
            <td>Investment Start Date</td>
            <td>${issuedDate}</td>
          </tr>
          <tr>
            <td>Maturity Date</td>
            <td>${maturityDate}</td>
          </tr>
          <tr>
            <td>Certificate Issued On</td>
            <td>${formatDate(new Date())}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div><!-- /cert-body -->

  <!-- Signatures -->
  <div class="signatures-section">

    <div class="sig-block">
      <div class="sig-image-zone">${sigLeftImageHtml}</div>
      <div class="sig-underline"></div>
      <div class="sig-name">${sigLeftName}</div>
      <div class="sig-role">${sigLeftPos}</div>
    </div>

    <div class="sig-center-seal">
      <img src="${logoUrl}" alt="Company Seal" class="seal-logo" onerror="this.style.display='none'" />
      <div class="seal-rc">RC: 773931</div>
      <div class="seal-motto">....quest for uniqueness in service.......</div>
    </div>

    <div class="sig-block">
      <div class="sig-image-zone">${sigRightImageHtml}</div>
      <div class="sig-underline"></div>
      <div class="sig-name">${sigRightName}</div>
      <div class="sig-role">${sigRightPos}</div>
    </div>

  </div>

  <!-- Footer -->
  <div class="cert-footer">
    <div class="footer-left">📞 +234 707 474 4676 | 0707 474 4677</div>
    <div class="footer-center">Build Wealth &bull; Secure Futures &bull; Live Better</div>
    <div class="footer-right">✉ info@livingvineproperties.com.ng &nbsp;|&nbsp; 14, Fadare Street, Ogba, Ikeja, Lagos</div>
  </div>

</div>
</body>
</html>`;
}

function downloadPDF(html, filename, isReceipt) {
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.width = '1000px';
    document.body.appendChild(element);

    const pdfName = filename.replace(/\.(html|txt)$/i, '') + '.pdf';

    const opt = {
        margin:       0,
        filename:     pdfName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: isReceipt ? 'portrait' : 'landscape' }
    };

    const run = () => {
        window.html2pdf().from(element).set(opt).save().then(() => {
            document.body.removeChild(element);
        });
    };

    if (window.html2pdf) {
        run();
    } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = run;
        document.head.appendChild(script);
    }
}

function openPrintWindow(html) {
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
}

// ── Modal Document Viewer ─────────────────────────────────────────────────
function DocumentModal({ type, investment, settings, onClose }) {
    const [downloading, setDownloading] = useState(false);
    const [done, setDone] = useState(false);

    const isReceipt = type === 'receipt';
    const html = isReceipt ? generateReceiptHTML(investment, settings) : generateCertificateHTML(investment, settings);
    const filename = isReceipt
        ? `LVP-Receipt-${investment._id?.slice(-6).toUpperCase()}.pdf`
        : `LVP-Certificate-${investment._id?.slice(-6).toUpperCase()}.pdf`;

    const handleDownload = () => {
        setDownloading(true);
        downloadPDF(html, filename, isReceipt);
        setTimeout(() => { setDownloading(false); setDone(true); }, 2500); // 2.5s to let PDF compile complete
    };

    const handlePrint = () => {
        openPrintWindow(html);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className={`p-6 text-white text-center ${isReceipt ? 'bg-gradient-to-br from-[#de1f25] to-orange-500' : 'bg-gradient-to-br from-amber-700 to-yellow-600'}`}>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        {isReceipt ? <FileImage size={28} /> : <Award size={28} />}
                    </div>
                    <h3 className="text-xl font-bold font-serif">{isReceipt ? 'Payment Receipt' : 'Investment Certificate'}</h3>
                    <p className="text-white/80 text-sm mt-1">
                        {isReceipt ? 'Download your official payment receipt' : 'Download your investment certificate'}
                    </p>
                </div>

                <div className="p-6 space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                        <div className="flex justify-between"><span className="text-gray-500">Investor</span><span className="font-semibold">{investment.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold text-[#de1f25]">{formatCurrency(investment.amountToInvest)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold capitalize">{investment.status}</span></div>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 text-white
                            ${isReceipt ? 'bg-[#de1f25] hover:bg-[#b0181d]' : 'bg-amber-600 hover:bg-amber-700'}`}
                    >
                        {downloading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : done ? (
                            <><CheckCircle2 size={16} /> Downloaded!</>
                        ) : (
                            <><Download size={16} /> Download {isReceipt ? 'Receipt' : 'Certificate'}</>
                        )}
                    </button>

                    <button onClick={handlePrint}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Printer size={16} /> Print / Save as PDF
                    </button>

                    <button onClick={onClose}
                        className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Main Export ───────────────────────────────────────────────────────────
export default function InvestmentDocuments({ investment }) {
    const [modal, setModal] = useState(null); // 'receipt' | 'certificate' | null
    const [settings, setSettings] = useState({});

    const isEligible = ['approved', 'active', 'liquidated'].includes(investment?.status);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) setSettings(data);
            } catch (err) {
                console.error('Failed to load website signature settings', err);
            }
        };
        if (isEligible) {
            fetchSettings();
        }
    }, [isEligible]);

    if (!isEligible) return null;

    return (
        <>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    📄 Official Documents
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setModal('receipt')}
                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#de1f25] hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <FileImage size={20} className="text-[#de1f25]" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-800">Receipt</p>
                            <p className="text-[10px] text-gray-400">Payment confirmation</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setModal('certificate')}
                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <Award size={20} className="text-amber-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-800">Certificate</p>
                            <p className="text-[10px] text-gray-400">Investment certificate</p>
                        </div>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {modal && (
                    <DocumentModal
                        type={modal}
                        investment={investment}
                        settings={settings}
                        onClose={() => setModal(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
