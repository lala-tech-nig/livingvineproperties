'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileImage, Award, Printer, X, Loader2, CheckCircle2 } from 'lucide-react';

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

// ── Generate and download Receipt as a styled HTML page ────────────────────
function generateReceiptHTML(investment) {
    const maturity = getMaturityDate(investment);
    const receiptNo = `LVP-${investment._id?.slice(-6).toUpperCase() || 'XXXXXX'}`;
    const today = formatDate(new Date());

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Investment Receipt — ${receiptNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f9f9f9; }
    .page { width: 794px; min-height: 1123px; background: white; margin: 0 auto; position: relative; }
    .header { background: linear-gradient(135deg, #de1f25 0%, #b0181d 100%); color: white; padding: 48px 56px 40px; }
    .logo-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
    .logo-text { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .logo-sub { font-size: 11px; opacity: 0.75; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
    .receipt-label { background: rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 20px; font-size: 12px; font-weight: 700; text-align: center; }
    .receipt-title { font-size: 36px; font-weight: 900; margin-bottom: 6px; }
    .receipt-subtitle { font-size: 14px; opacity: 0.8; }
    .body { padding: 48px 56px; }
    .receipt-meta { display: flex; justify-content: space-between; background: #fff5f5; border: 1px solid #fecaca; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }
    .meta-item { }
    .meta-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .meta-value { font-size: 14px; font-weight: 700; color: #1f2937; }
    .section-title { font-size: 11px; font-weight: 700; color: #de1f25; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    .data-table tr td { padding: 10px 0; border-bottom: 1px solid #f9fafb; font-size: 13px; }
    .data-table tr td:first-child { color: #6b7280; font-weight: 500; width: 45%; }
    .data-table tr td:last-child { color: #111827; font-weight: 600; text-align: right; }
    .highlight-box { background: linear-gradient(135deg, #fff5f5 0%, #fff0e8 100%); border: 1px solid #fecaca; border-radius: 16px; padding: 24px 28px; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; }
    .amount-label { font-size: 12px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
    .amount-value { font-size: 32px; font-weight: 900; color: #de1f25; }
    .roi-value { font-size: 32px; font-weight: 900; color: #16a34a; text-align: right; }
    .divider { width: 1px; height: 50px; background: #fecaca; }
    .stamp { position: absolute; bottom: 80px; right: 56px; width: 100px; height: 100px; border: 3px solid #de1f25; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); opacity: 0.8; }
    .stamp-text { font-size: 10px; font-weight: 900; color: #de1f25; text-align: center; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4; }
    .footer { border-top: 1px solid #f3f4f6; padding: 24px 56px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #9ca3af; }
    .watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; }
    .watermark-text { font-size: 100px; font-weight: 900; color: rgba(222,31,37,0.04); text-transform: uppercase; letter-spacing: 8px; transform: rotate(-30deg); white-space: nowrap; }
    .content { position: relative; z-index: 1; }
  </style>
</head>
<body>
<div class="page">
  <div class="watermark"><div class="watermark-text">LIVING VINE</div></div>
  <div class="header">
    <div class="logo-row">
      <div>
        <div class="logo-text">🏡 Living Vine Properties</div>
        <div class="logo-sub">Trusted Real Estate Investment Partner</div>
      </div>
      <div class="receipt-label">PAYMENT RECEIPT</div>
    </div>
    <div class="receipt-title">Investment Receipt</div>
    <div class="receipt-subtitle">Official acknowledgement of investment payment</div>
  </div>

  <div class="body content">
    <div class="receipt-meta">
      <div class="meta-item"><div class="meta-label">Receipt No.</div><div class="meta-value">${receiptNo}</div></div>
      <div class="meta-item"><div class="meta-label">Date Issued</div><div class="meta-value">${today}</div></div>
      <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value" style="color: #16a34a;">${(investment.status || '').toUpperCase()}</div></div>
    </div>

    <p class="section-title">Investor Information</p>
    <table class="data-table">
      <tr><td>Full Name</td><td>${investment.name || '—'}</td></tr>
      <tr><td>Email Address</td><td>${investment.email || '—'}</td></tr>
      <tr><td>Phone Number</td><td>${investment.phoneNumber || '—'}</td></tr>
      <tr><td>Contact Address</td><td>${investment.contactAddress || '—'}</td></tr>
    </table>

    <p class="section-title">Investment Details</p>
    <div class="highlight-box">
      <div><div class="amount-label">Principal Amount</div><div class="amount-value">${formatCurrency(investment.amountToInvest)}</div></div>
      <div class="divider"></div>
      <div><div class="amount-label" style="text-align:right;">Expected Return (ROI)</div><div class="roi-value">${formatCurrency(investment.expectedROI)}</div></div>
    </div>
    <table class="data-table">
      <tr><td>Investment Duration</td><td>${investment.durationInMonths || '—'} months</td></tr>
      <tr><td>Start Date</td><td>${formatDate(investment.startDate)}</td></tr>
      <tr><td>Maturity Date</td><td>${maturity ? formatDate(maturity) : '—'}</td></tr>
      <tr><td>After Maturity</td><td>${investment.principalActionAfterMaturity || '—'}</td></tr>
    </table>

    <p class="section-title">Payment Account</p>
    <table class="data-table">
      <tr><td>Account Name</td><td>${investment.ceoPaymentAccount?.accountName || 'Living Vine Properties'}</td></tr>
      <tr><td>Bank</td><td>${investment.ceoPaymentAccount?.bankName || '—'}</td></tr>
      <tr><td>Account Number</td><td>${investment.ceoPaymentAccount?.accountNumber || '—'}</td></tr>
    </table>

    <div class="stamp"><div class="stamp-text">OFFICIAL<br/>RECEIPT<br/>✓</div></div>
  </div>

  <div class="footer">
    <div>Living Vine Properties Ltd. | info@livingvineproperties.com</div>
    <div>Generated: ${today} | This is a computer-generated receipt</div>
  </div>
</div>
</body></html>`;
}

// ── Generate and download Certificate as styled HTML page ──────────────────
function generateCertificateHTML(investment) {
    const maturity = getMaturityDate(investment);
    const certNo = `LVP-CERT-${investment._id?.slice(-6).toUpperCase() || 'XXXXXX'}`;
    const today = formatDate(new Date());

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Investment Certificate — ${certNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f5f0e8; font-family: 'Inter', sans-serif; }
    .page { width: 794px; min-height: 1123px; background: white; margin: 0 auto; position: relative; overflow: hidden; }
    .gold-border { position: absolute; inset: 24px; border: 3px solid #d4af37; pointer-events: none; z-index: 10; border-radius: 4px; }
    .gold-border-inner { position: absolute; inset: 30px; border: 1px solid #d4af37; pointer-events: none; z-index: 10; border-radius: 2px; opacity: 0.5; }
    .corner { position: absolute; width: 32px; height: 32px; border-color: #d4af37; z-index: 20; }
    .corner-tl { top: 20px; left: 20px; border-top: 4px solid; border-left: 4px solid; }
    .corner-tr { top: 20px; right: 20px; border-top: 4px solid; border-right: 4px solid; }
    .corner-bl { bottom: 20px; left: 20px; border-bottom: 4px solid; border-left: 4px solid; }
    .corner-br { bottom: 20px; right: 20px; border-bottom: 4px solid; border-right: 4px solid; }
    .content { padding: 70px 80px; position: relative; z-index: 5; }
    .org-row { text-align: center; margin-bottom: 8px; }
    .org-name { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: #1a1a1a; letter-spacing: 2px; }
    .org-tagline { font-size: 11px; color: #888; letter-spacing: 4px; text-transform: uppercase; margin-top: 4px; }
    .divider-gold { height: 2px; background: linear-gradient(to right, transparent, #d4af37, transparent); margin: 20px 0; }
    .cert-title { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 900; color: #de1f25; text-align: center; margin-bottom: 4px; line-height: 1.1; }
    .cert-sub { font-size: 12px; text-align: center; color: #888; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 24px; }
    .certifies-text { text-align: center; font-size: 14px; color: #555; margin-bottom: 12px; font-style: italic; }
    .investor-name { font-family: 'Playfair Display', serif; font-size: 38px; color: #1a1a1a; text-align: center; margin: 16px 0; font-weight: 700; font-style: italic; border-bottom: 2px solid #d4af37; padding-bottom: 8px; display: inline-block; width: 100%; }
    .invest-statement { text-align: center; font-size: 14px; color: #555; line-height: 1.8; margin: 16px 0 32px; }
    .amount-box { background: linear-gradient(135deg, #fef9ec 0%, #fff8e1 100%); border: 1px solid #d4af37; border-radius: 12px; padding: 20px 32px; text-align: center; margin: 0 auto 32px; max-width: 400px; }
    .amount-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .amount-value { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: #d4af37; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px; }
    .detail-box { background: #f9f9f9; border-radius: 8px; padding: 14px 16px; }
    .detail-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .detail-value { font-size: 14px; font-weight: 700; color: #1a1a1a; }
    .signatures { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
    .sig-block { text-align: center; flex: 1; }
    .sig-line { width: 150px; height: 1px; background: #ccc; margin: 0 auto 4px; }
    .sig-title { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .seal { width: 90px; height: 90px; border: 3px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
    .seal-text { font-size: 9px; font-weight: 900; color: #d4af37; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.5; }
    .cert-no { position: absolute; top: 36px; right: 50px; font-size: 10px; color: #aaa; font-weight: 600; }
    .watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 1; }
    .watermark-text { font-size: 80px; font-weight: 900; color: rgba(212,175,55,0.05); transform: rotate(-30deg); white-space: nowrap; letter-spacing: 8px; }
  </style>
</head>
<body>
<div class="page">
  <div class="watermark"><div class="watermark-text">LIVING VINE PROPERTIES</div></div>
  <div class="gold-border"></div>
  <div class="gold-border-inner"></div>
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>
  <div class="cert-no">${certNo}</div>

  <div class="content">
    <div class="org-row">
      <div class="org-name">🏡 LIVING VINE PROPERTIES</div>
      <div class="org-tagline">Trusted Real Estate Investment Partner · Est. 2020</div>
    </div>

    <div class="divider-gold"></div>

    <h1 class="cert-title">Certificate of Investment</h1>
    <p class="cert-sub">This is to certify that</p>

    <p class="certifies-text">Living Vine Properties Limited hereby certifies that</p>
    <div class="investor-name">${investment.name || '—'}</div>

    <p class="invest-statement">
      has made a bona fide investment with Living Vine Properties Limited<br/>
      and is entitled to the full benefits thereof as outlined below.
    </p>

    <div class="amount-box">
      <div class="amount-label">Investment Principal</div>
      <div class="amount-value">${formatCurrency(investment.amountToInvest)}</div>
    </div>

    <div class="details-grid">
      <div class="detail-box"><div class="detail-label">Expected Return</div><div class="detail-value" style="color:#16a34a;">${formatCurrency(investment.expectedROI)}</div></div>
      <div class="detail-box"><div class="detail-label">Duration</div><div class="detail-value">${investment.durationInMonths || '—'} months</div></div>
      <div class="detail-box"><div class="detail-label">Start Date</div><div class="detail-value">${formatDate(investment.startDate)}</div></div>
      <div class="detail-box"><div class="detail-label">Maturity Date</div><div class="detail-value">${maturity ? formatDate(maturity) : '—'}</div></div>
    </div>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <p class="sig-title">Chief Executive Officer</p>
      </div>
      <div class="sig-block">
        <div class="seal"><div class="seal-text">OFFICIAL<br/>SEAL<br/>★<br/>LIVING VINE</div></div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <p class="sig-title">Investment Director</p>
      </div>
    </div>

    <div class="divider-gold" style="margin-top: 32px;"></div>
    <p style="text-align:center; font-size:10px; color:#bbb; margin-top:8px;">Issued: ${today} · This certificate is valid only with the official seal of Living Vine Properties Limited.</p>
  </div>
</div>
</body></html>`;
}

function downloadHTML(html, filename) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function openPrintWindow(html) {
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
}

// ── Modal Document Viewer ─────────────────────────────────────────────────
function DocumentModal({ type, investment, onClose }) {
    const [downloading, setDownloading] = useState(false);
    const [done, setDone] = useState(false);

    const isReceipt = type === 'receipt';
    const html = isReceipt ? generateReceiptHTML(investment) : generateCertificateHTML(investment);
    const filename = isReceipt
        ? `LVP-Receipt-${investment._id?.slice(-6).toUpperCase()}.html`
        : `LVP-Certificate-${investment._id?.slice(-6).toUpperCase()}.html`;

    const handleDownload = () => {
        setDownloading(true);
        downloadHTML(html, filename);
        setTimeout(() => { setDownloading(false); setDone(true); }, 800);
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

    const isEligible = ['approved', 'active', 'liquidated'].includes(investment?.status);

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
                        onClose={() => setModal(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
