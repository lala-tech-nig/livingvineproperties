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
        <div class="brand-name">LIVING VINE PRPPERTIES INVESTMENT LIMITED</div>
        <div class="brand-legal">INVESTMENT LIMITED</div>
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
          Being Payment for ${investment.durationInMonths || '12'} Month Investment Subscription 
          at the rate of ${investment.roiPercent || '26'}% Return on Investment
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
      <span>No. 14, Fadare Street, Off Kayode Street, Ogba, Ikeja, Lagos</span>
    </div>
  </div>
  
  <div class="tagline-row">
    BUILD WEALTH &bull; SECURE FUTURES &bull; LIVE BETTER
  </div>
</div>
</body>
</html>`;
}

// ── Generate high-fidelity Investment Certificate HTML ──────────────────
function generateCertificateHTML(investment, settings = {}) {
    const maturity = getMaturityDate(investment);
    const certNo = `LVP-${investment.startDate ? new Date(investment.startDate).getFullYear() : new Date().getFullYear()}/${investment.durationInMonths || '12'}/${investment._id?.slice(-3).toUpperCase() || '001'}`;
    const today = formatDate(new Date());
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoUrl = `${origin}/living-logo.png`;
    const amountInWords = toNairaWords(investment.amountToInvest || 0);

    const sigLeftName = settings.certSigneeLeftName || 'ADMIN MANAGER';
    const sigLeftPos = settings.certSigneeLeftPosition || 'Admin Manager';
    const sigLeftImage = settings.certSigneeLeftSignature 
        ? `<img src="${settings.certSigneeLeftSignature}" alt="Admin Signature" class="sig-img" />`
        : '<div class="sig-placeholder-line"></div>';

    const sigRightName = settings.certSigneeRightName || 'BDM';
    const sigRightPos = settings.certSigneeRightPosition || 'BDM';
    const sigRightImage = settings.certSigneeRightSignature 
        ? `<img src="${settings.certSigneeRightSignature}" alt="BDM Signature" class="sig-img" />`
        : '<div class="sig-placeholder-line"></div>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Investment Certificate — ${certNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', sans-serif; background: #fafafa; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 1000px; height: 750px; background: #fdfcf7; margin: 20px auto; position: relative; padding: 45px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border-radius: 12px; }
    
    /* Gold double borders */
    .gold-border-outer { position: absolute; inset: 20px; border: 2.5px solid #d4af37; pointer-events: none; border-radius: 6px; z-index: 10; }
    .gold-border-inner { position: absolute; inset: 26px; border: 1px solid #d4af37; pointer-events: none; border-radius: 4px; opacity: 0.6; z-index: 10; }
    
    /* Styled Corner Curves matching Uploaded Design */
    .corner-curve { position: absolute; width: 120px; height: 120px; pointer-events: none; z-index: 5; }
    .curve-tl { top: 0; left: 0; border-top: 25px solid #b0181d; border-left: 25px solid #b0181d; border-top-left-radius: 12px; border-bottom-right-radius: 100%; border-right: 3px solid #d4af37; border-bottom: 3px solid #d4af37; background: #b0181d; }
    .curve-br { bottom: 0; right: 0; border-bottom: 25px solid #b0181d; border-right: 25px solid #b0181d; border-bottom-right-radius: 12px; border-top-left-radius: 100%; border-left: 3px solid #d4af37; border-top: 3px solid #d4af37; background: #b0181d; }

    /* Header structure */
    .header { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; margin-bottom: 12px; padding: 0 30px; position: relative; z-index: 15; }
    .logo-block { display: flex; align-items: center; gap: 14px; }
    .logo-img { height: 50px; width: auto; object-fit: contain; }
    .brand-title { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 900; color: #b0181d; letter-spacing: 0.5px; line-height: 1.1; }
    .brand-legal { font-size: 14px; font-weight: 800; color: #111; letter-spacing: 0.5px; }
    .brand-tagline { font-size: 9px; font-style: italic; color: #777; margin-top: 2px; font-weight: 500; }
    
    .certificate-ribbon-seal { text-align: center; position: relative; width: 90px; height: 90px; margin-right: 15px; }
    .ribbon-img { width: 100%; height: 100%; object-fit: contain; }
    .ribbon-text-container { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 8px; color: white; text-align: center; }
    .ribbon-label { font-size: 6px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #ffd700; }
    .ribbon-val { font-size: 8px; font-weight: 900; margin-top: 1px; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

    /* Content Center Box */
    .content-center { text-align: center; position: relative; z-index: 15; padding: 0 40px; }
    
    .cert-heading-box { margin-bottom: 5px; }
    .cert-title { font-family: 'Cinzel', serif; font-size: 40px; font-weight: 900; color: #b0181d; letter-spacing: 3px; line-height: 1; }
    .cert-subtitle { font-size: 10px; font-weight: 800; color: #b0181d; letter-spacing: 5px; text-transform: uppercase; margin-top: 8px; }
    
    .divider-dots { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 10px 0; }
    .divider-dot { width: 4px; height: 4px; background: #d4af37; rotate: 45deg; transform: rotate(45deg); }
    .divider-gold-line { width: 80px; height: 1px; background: #d4af37; }

    .presented-lbl { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 5px; }
    
    /* Name display with side bars */
    .name-row { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 12px; }
    .name-side-bar { height: 2px; width: 60px; background: #d4af37; border-radius: 2px; }
    .name-circle { width: 5px; height: 5px; background: #d4af37; border-radius: 50%; }
    .investor-name { font-family: 'Cinzel', serif; font-size: 26px; font-weight: 800; color: #111; letter-spacing: 1px; text-transform: uppercase; }

    .investment-declaration { font-size: 11px; color: #444; font-weight: 600; line-height: 1.8; max-width: 750px; margin: 0 auto 18px; letter-spacing: 0.5px; }
    .text-red { color: #b0181d; font-weight: 800; }

    /* Period and Provider Box */
    .summary-bar { display: flex; align-items: center; justify-content: center; gap: 20px; border: 1.5px solid #d4af37; border-radius: 10px; padding: 12px 30px; max-width: 750px; margin: 0 auto 20px; background: #fdfdfb; }
    .summary-item { display: flex; align-items: center; gap: 10px; font-size: 11px; }
    .summary-icon { font-size: 16px; }
    .summary-text-col { display: flex; flex-direction: column; text-align: left; }
    .summary-label { font-size: 9px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .summary-val { font-weight: 800; color: #111; }
    .summary-divider { width: 1.5px; height: 35px; background: #e5e7eb; }

    /* Bottom Signatures section */
    .signatures-row { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 20px; align-items: flex-end; padding: 0 40px; margin-top: 15px; position: relative; z-index: 15; }
    .sig-block { text-align: center; }
    .sig-container { height: 50px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 6px; }
    .sig-img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .sig-placeholder-line { width: 150px; height: 1.5px; background: #ccc; margin: 0 auto; }
    .sig-name { font-size: 10px; font-weight: 800; color: #111; letter-spacing: 0.5px; margin-bottom: 2px; }
    .sig-role { font-size: 9px; font-weight: 700; color: #b0181d; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .center-logo-stamp { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin-bottom: -5px; }
    .stamp-logo { height: 40px; width: auto; object-fit: contain; }
    .rc-box { background: black; color: white; font-size: 7.5px; font-weight: 900; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; }
    .cert-motto { font-size: 9px; font-style: italic; color: #b0181d; font-weight: 700; margin-top: 4px; }

    @media print {
      body { background: white; }
      .page { box-shadow: none; margin: 0; width: 100%; height: 100%; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="gold-border-outer"></div>
  <div class="gold-border-inner"></div>
  
  <div class="corner-curve curve-tl"></div>
  <div class="corner-curve curve-br"></div>

  <div class="header">
    <div class="logo-block">
      <img src="${logoUrl}" alt="LVP Logo" class="logo-img" onerror="this.style.display='none'" />
      <div>
        <div class="brand-title">LIVING VINE PRPPERTIES INVESTMENT LIMITED</div>
        <div class="brand-legal">INVESTMENT LIMITED</div>
        <div class="brand-tagline">Building Wealth. Securing Futures.</div>
      </div>
    </div>
    
    <div class="certificate-ribbon-seal">
      <svg class="ribbon-img" viewBox="0 0 100 100" fill="none">
        <path d="M50 5L75 22V55L50 82L25 55V22L50 5Z" fill="#b0181d" />
        <path d="M50 5L75 22V55L50 82V5Z" fill="#991519" />
        <path d="M50 15L67 27V50L50 70L33 50V27L50 15Z" fill="#d4af37" />
        <path d="M35 70L20 95L50 82L80 95L65 70" fill="#b0181d" opacity="0.8" />
        <path d="M50 70L50 82L80 95L65 70" fill="#991519" opacity="0.8" />
        <circle cx="50" cy="38" r="18" fill="#b0181d" />
      </svg>
      <div class="ribbon-text-container">
        <div class="ribbon-label">CERT NO.</div>
        <div class="ribbon-val">${certNo}</div>
      </div>
    </div>
  </div>

  <div class="content-center">
    <div class="cert-heading-box">
      <div class="cert-title">CERTIFICATE</div>
      <div class="cert-subtitle">of investment</div>
    </div>
    
    <div class="divider-dots">
      <div class="divider-gold-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-dot" style="width: 6px; height: 6px;"></div>
      <div class="divider-dot"></div>
      <div class="divider-gold-line"></div>
    </div>

    <div class="presented-lbl">This Certificate is Proudly Presented To</div>
    
    <div class="name-row">
      <div class="name-side-bar"></div>
      <div class="name-circle"></div>
      <div class="investor-name">${investment.name || '—'}</div>
      <div class="name-circle"></div>
      <div class="name-side-bar"></div>
    </div>

    <div class="investment-declaration">
      FOR INVESTING THE SUM OF <span class="text-red">${amountInWords}</span> 
      FOR A PERIOD OF <span class="text-red">${investment.durationInMonths || '12'} MONTHS</span> 
      AT AN INTEREST RATE OF <span class="text-red">${investment.roiPercent || '26'}%</span>
    </div>

    <div class="summary-bar">
      <div class="summary-item">
        <span class="summary-icon">📅</span>
        <div class="summary-text-col">
          <span class="summary-label">Period</span>
          <span class="summary-val">${formatDate(investment.startDate)} - ${maturity ? formatDate(maturity) : '—'}</span>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <span class="summary-icon">💼</span>
        <div class="summary-text-col">
          <span class="summary-label">From</span>
          <span class="summary-val">LIVING VINE PRPPERTIES INVESTMENT LIMITED</span>
        </div>
      </div>
    </div>
  </div>

  <div class="signatures-row">
    <div class="sig-block">
      <div class="sig-container">
        ${sigLeftImage}
      </div>
      <div class="sig-name">${sigLeftName}</div>
      <div class="sig-role">${sigLeftPos}</div>
    </div>

    <div class="center-logo-stamp">
      <img src="${logoUrl}" alt="Stamp Logo" class="stamp-logo" onerror="this.style.display='none'" />
      <div class="rc-box">RC: 773931</div>
      <div class="cert-motto">....quest for uniqueness in service.......</div>
    </div>

    <div class="sig-block">
      <div class="sig-container">
        ${sigRightImage}
      </div>
      <div class="sig-name">${sigRightName}</div>
      <div class="sig-role">${sigRightPos}</div>
    </div>
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
