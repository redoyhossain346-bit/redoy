import React, { useState, useEffect } from 'react';
import { Mail, Send, RefreshCw, LogIn, CheckCircle2, AlertCircle, Sparkles, FileText, Package, Clock, DollarSign, X, ExternalLink, Inbox } from 'lucide-react';
import { googleSignIn, getAccessToken, logoutGoogle, initAuth } from '../services/googleSheetsAuth';
import { gmailService, GmailProfile, GmailMessageSummary } from '../services/gmailService';
import { Transaction, InventoryItem, WorkHour } from '../types';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

interface GmailManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  inventory: InventoryItem[];
  workHours: WorkHour[];
  initialRecipient?: string;
  initialSubject?: string;
  initialBody?: string;
}

export default function GmailManagerModal({
  isOpen,
  onClose,
  transactions,
  inventory,
  workHours,
  initialRecipient = '',
  initialSubject = '',
  initialBody = ''
}: GmailManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'messages'>('compose');
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Compose Form State
  const [recipient, setRecipient] = useState(initialRecipient);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [selectedTemplate, setSelectedTemplate] = useState<'custom' | 'receipt' | 'daily' | 'lowstock'>('custom');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');

  // Confirmation Modal for Sending Email
  const [confirmSendModal, setConfirmSendModal] = useState<{
    isOpen: boolean;
    to: string;
    subject: string;
    actionType: 'send' | 'draft';
  }>({ isOpen: false, to: '', subject: '', actionType: 'send' });

  // Messages List
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    initAuth(
      async (_, t) => {
        setToken(t);
        await loadProfile(t);
      },
      () => {
        setToken(null);
        setProfile(null);
      }
    );

    const currentToken = getAccessToken();
    if (currentToken) {
      setToken(currentToken);
      loadProfile(currentToken);
    }
  }, [isOpen]);

  const loadProfile = async (accessToken: string) => {
    try {
      setLoading(true);
      const prof = await gmailService.getProfile(accessToken);
      setProfile(prof);
      setStatusMessage(null);
    } catch (err: any) {
      console.warn('Gmail profile load error:', err);
      if (err.message?.includes('401') || err.message?.includes('authentication credentials')) {
        setToken(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setStatusMessage({ type: 'info', text: 'Connecting to Google Gmail...' });
      const res = await googleSignIn();
      if (res) {
        setToken(res.accessToken);
        await loadProfile(res.accessToken);
        setStatusMessage({ type: 'success', text: `Connected as ${res.user.email}` });
      }
    } catch (err: any) {
      console.error('Google Sign in failed:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sign in with Google' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await logoutGoogle();
    setToken(null);
    setProfile(null);
    setStatusMessage({ type: 'info', text: 'Disconnected from Google account' });
  };

  // Auto-generate Template Content
  const applyTemplate = (templateType: 'receipt' | 'daily' | 'lowstock', txId?: string) => {
    setSelectedTemplate(templateType);
    if (templateType === 'receipt') {
      const tx = transactions.find(t => t.id === txId) || transactions[0];
      if (!tx) {
        setSubject('Sales Receipt - Cell Terminal');
        setBody('<p>Thank you for your business!</p>');
        return;
      }
      if (tx.customer?.email) {
        setRecipient(tx.customer.email);
      }
      setSubject(`Receipt for Order #${tx.id.slice(-6).toUpperCase()} - Cell Terminal`);
      const itemDesc = tx.items.map(i => `${i.category}${i.model ? ` (${i.model})` : ''}`).join(', ') || tx.category;
      const txDateStr = tx.date || (tx.createdAt ? new Date(tx.createdAt).toISOString() : new Date().toISOString());

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
          <h2 style="color: #f59e0b; margin-top: 0;">Cell Terminal - Official Receipt</h2>
          <p><strong>Date:</strong> ${format(new Date(txDateStr), 'PPP p')}</p>
          <p><strong>Customer:</strong> ${tx.customer?.name || 'Valued Customer'}</p>
          <p><strong>Items / Services:</strong> ${itemDesc}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Subtotal:</td>
              <td style="text-align: right; font-weight: bold;">${formatCurrency(tx.subTotal || (tx.amount - tx.tax + tx.discount))}</td>
            </tr>
            ${tx.discount > 0 ? `
            <tr>
              <td style="padding: 6px 0; color: #ef4444;">Discount:</td>
              <td style="text-align: right; color: #ef4444; font-weight: bold;">-${formatCurrency(tx.discount)}</td>
            </tr>` : ''}
            ${tx.tax > 0 ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Sales Tax:</td>
              <td style="text-align: right; font-weight: bold;">${formatCurrency(tx.tax)}</td>
            </tr>` : ''}
            <tr style="font-size: 16px; font-weight: bold;">
              <td style="padding: 10px 0; border-top: 2px solid #1e293b;">Total Paid:</td>
              <td style="text-align: right; padding: 10px 0; border-top: 2px solid #1e293b; color: #059669;">${formatCurrency(tx.amount)}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">Thank you for choosing Cell Terminal! For questions or support, reply to this email.</p>
        </div>
      `;
      setBody(htmlBody);
    } else if (templateType === 'daily') {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTx = transactions.filter(t => t.date.startsWith(todayStr));
      const totalRevenue = todayTx.reduce((sum, t) => sum + t.amount, 0);
      const totalCash = todayTx.reduce((sum, t) => sum + (t.paymentSplit?.cash || (t.paymentMethod === 'CASH' ? t.amount : 0)), 0);
      const totalCard = todayTx.reduce((sum, t) => sum + (t.paymentSplit?.card || (t.paymentMethod === 'CARD' ? t.amount : 0)), 0);
      const totalZelle = todayTx.reduce((sum, t) => sum + (t.paymentSplit?.zelle || (t.paymentMethod === 'ZELLE' ? t.amount : 0)), 0);

      setSubject(`Daily Sales & Terminal Report - ${format(new Date(), 'PP')}`);
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
          <h2 style="color: #4f46e5; margin-top: 0;">Cell Terminal - Daily Executive Summary</h2>
          <p><strong>Report Date:</strong> ${format(new Date(), 'PPPP')}</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0; color: #334155;">Key Metrics</h3>
            <p style="margin: 4px 0;"><strong>Total Transactions:</strong> ${todayTx.length}</p>
            <p style="margin: 4px 0; font-size: 18px; color: #059669;"><strong>Gross Revenue:</strong> ${formatCurrency(totalRevenue)}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 8px;">Method</th>
                <th style="padding: 8px; text-align: right;">Total Collected</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 6px 8px;">Cash</td><td style="padding: 6px 8px; text-align: right;">${formatCurrency(totalCash)}</td></tr>
              <tr><td style="padding: 6px 8px;">Card</td><td style="padding: 6px 8px; text-align: right;">${formatCurrency(totalCard)}</td></tr>
              <tr><td style="padding: 6px 8px;">Zelle / Transfer</td><td style="padding: 6px 8px; text-align: right;">${formatCurrency(totalZelle)}</td></tr>
            </tbody>
          </table>
          <p style="margin-top: 25px; font-size: 12px; color: #94a3b8;">Automated Daily Store Digest generated by Cell Terminal Manager.</p>
        </div>
      `;
      setBody(htmlBody);
    } else if (templateType === 'lowstock') {
      const lowStockItems = inventory.filter(i => i.quantity <= i.minStock);
      setSubject(`[URGENT] Inventory Reorder Alert - ${lowStockItems.length} Low Stock Items`);
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #fecdd3; border-radius: 12px; color: #1e293b;">
          <h2 style="color: #e11d48; margin-top: 0;">Stock Alert: Items Below Minimum Threshold</h2>
          <p>The following <strong>${lowStockItems.length} inventory items</strong> require immediate replenishment:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #ffe4e6; text-align: left; color: #9f1239;">
                <th style="padding: 8px;">Part / Asset Name</th>
                <th style="padding: 8px;">Category</th>
                <th style="padding: 8px; text-align: center;">Current Stock</th>
                <th style="padding: 8px; text-align: center;">Min Threshold</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockItems.map(i => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 8px; font-weight: bold;">${i.name}</td>
                  <td style="padding: 8px; color: #64748b;">${i.category}</td>
                  <td style="padding: 8px; text-align: center; color: #e11d48; font-weight: bold;">${i.quantity}</td>
                  <td style="padding: 8px; text-align: center; color: #64748b;">${i.minStock}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Please initiate supplier purchase orders promptly.</p>
        </div>
      `;
      setBody(htmlBody);
    }
  };

  // Open confirmation dialog before actual Gmail API mutation
  const promptSendConfirmation = (actionType: 'send' | 'draft') => {
    if (!recipient && actionType === 'send') {
      setStatusMessage({ type: 'error', text: 'Please enter a recipient email address.' });
      return;
    }
    if (!subject) {
      setStatusMessage({ type: 'error', text: 'Please enter a email subject.' });
      return;
    }
    setConfirmSendModal({
      isOpen: true,
      to: recipient,
      subject,
      actionType
    });
  };

  // Perform actual execution after confirmation
  const executeSendOrDraft = async () => {
    const { actionType } = confirmSendModal;
    setConfirmSendModal(prev => ({ ...prev, isOpen: false }));

    const currentToken = getAccessToken();
    if (!currentToken) {
      setStatusMessage({ type: 'error', text: 'Not authenticated with Google Gmail.' });
      return;
    }

    try {
      setLoading(true);
      if (actionType === 'send') {
        setStatusMessage({ type: 'info', text: 'Sending email via Gmail...' });
        const res = await gmailService.sendEmail(currentToken, recipient, subject, body, true);
        setStatusMessage({ type: 'success', text: `Email sent successfully! (ID: ${res.id})` });
        // Clear form
        setRecipient('');
        setSubject('');
        setBody('');
      } else {
        setStatusMessage({ type: 'info', text: 'Saving draft to Gmail...' });
        const res = await gmailService.createDraft(currentToken, recipient, subject, body, true);
        setStatusMessage({ type: 'success', text: `Draft saved to Gmail! (ID: ${res.id})` });
      }
    } catch (err: any) {
      console.error('Gmail action error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to execute Gmail operation' });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    const currentToken = getAccessToken();
    if (!currentToken) return;

    try {
      setLoadingMessages(true);
      const list = await gmailService.listMessages(currentToken, 12, searchQuery);
      setMessages(list);
    } catch (err: any) {
      console.error('Failed to list Gmail messages:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load messages from Gmail' });
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages' && token) {
      loadMessages();
    }
  }, [activeTab, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">Gmail Manager & Direct Emailing</h2>
              <p className="text-[11px] text-white/80 font-medium">Send Customer Receipts, Daily Reports & Stock Alerts directly via Google Mail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Connection Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {token && profile ? (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700">Connected:</span>
              <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {profile.emailAddress}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                ({profile.messagesTotal.toLocaleString()} total emails)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-800 font-medium">
              <AlertCircle size={16} className="text-amber-600" />
              <span>Connect your Google account to enable direct Gmail integration.</span>
            </div>
          )}

          <div>
            {!token ? (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="gsi-material-button inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-300 shadow-sm transition-all active:scale-95 text-xs"
              >
                <LogIn size={16} className="text-red-500" />
                <span>Connect Gmail</span>
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
              {statusMessage.type === 'error' && <AlertCircle size={16} className="text-rose-600" />}
              {statusMessage.type === 'info' && <RefreshCw size={16} className="text-indigo-600 animate-spin" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'compose'
                ? 'border-red-600 text-red-600 bg-red-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Send size={14} />
            <span>Compose Email</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'messages'
                ? 'border-red-600 text-red-600 bg-red-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Inbox size={14} />
            <span>Recent Messages</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!token ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-inner">
                <Mail size={32} />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Connect Google Gmail Account</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Authenticate with your Google account to generate and dispatch formatted HTML receipts, daily executive store digests, and stock replenishment emails directly through your Gmail.
                </p>
              </div>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <LogIn size={18} />
                <span>Sign in with Google Gmail</span>
              </button>
            </div>
          ) : activeTab === 'compose' ? (
            <div className="space-y-5">
              {/* Template Quick Selection */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Auto-Fill Email Templates
                  </span>
                  {selectedTemplate === 'receipt' && (
                    <select
                      value={selectedTransactionId}
                      onChange={(e) => {
                        setSelectedTransactionId(e.target.value);
                        applyTemplate('receipt', e.target.value);
                      }}
                      className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 outline-none"
                    >
                      <option value="">Select Transaction...</option>
                      {transactions.map((tx) => (
                        <option key={tx.id} value={tx.id}>
                          #{tx.id.slice(-6).toUpperCase()} - {tx.customer?.name || 'Customer'} (${tx.amount})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate('receipt')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      selectedTemplate === 'receipt'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FileText size={16} />
                    <div>
                      <div className="text-xs font-black uppercase">Customer Receipt</div>
                      <div className="text-[10px] opacity-80">Itemized transaction receipt</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate('daily')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      selectedTemplate === 'daily'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <DollarSign size={16} />
                    <div>
                      <div className="text-xs font-black uppercase">Daily Sales Digest</div>
                      <div className="text-[10px] opacity-80">Daily totals & payment splits</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate('lowstock')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      selectedTemplate === 'lowstock'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Package size={16} />
                    <div>
                      <div className="text-xs font-black uppercase">Stock Alert</div>
                      <div className="text-[10px] opacity-80">Reorder alert for low stock</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4 bg-white p-5 border border-slate-200 rounded-2xl">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    To (Recipient Email) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="customer@example.com or manager@store.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-red-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-red-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Email Content (HTML / Text)
                  </label>
                  <textarea
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type email body here or select a template above..."
                    className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:bg-white focus:border-red-500 outline-none transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => promptSendConfirmation('draft')}
                    disabled={loading || !subject}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    Save as Gmail Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => promptSendConfirmation('send')}
                    disabled={loading || !recipient || !subject}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Send Email via Gmail</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Messages List Tab */
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search emails in Gmail (e.g., receipt, customer, stock)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadMessages()}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-red-500"
                />
                <button
                  onClick={loadMessages}
                  disabled={loadingMessages}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw size={14} className={loadingMessages ? 'animate-spin' : ''} />
                  <span>Search</span>
                </button>
              </div>

              {loadingMessages ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs flex justify-center items-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-red-600" />
                  <span>Fetching emails from Google Gmail...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs">
                  No messages found matching query.
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-red-300 transition-all flex flex-col gap-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate max-w-[300px]">
                          {msg.subject || '(No Subject)'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.date ? format(new Date(msg.date), 'MMM d, h:mm a') : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[350px]">
                          <strong className="text-slate-600">From:</strong> {msg.from}
                        </span>
                        <a
                          href={`https://mail.google.com/mail/u/0/#inbox/${msg.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
                        >
                          <span>Open in Gmail</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      {msg.snippet && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg mt-1 font-sans">
                          {msg.snippet}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explicit User Confirmation Modal for Gmail Mutation (MANDATORY PER SKILL.MD) */}
      {confirmSendModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
              <Mail size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Confirm Gmail Operation
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to {confirmSendModal.actionType === 'send' ? 'send this email' : 'save this draft'} via your Gmail account?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
              <div><strong className="text-slate-700">Action:</strong> {confirmSendModal.actionType === 'send' ? 'Send Email' : 'Create Draft'}</div>
              {confirmSendModal.to && <div><strong className="text-slate-700">Recipient:</strong> {confirmSendModal.to}</div>}
              <div><strong className="text-slate-700">Subject:</strong> {confirmSendModal.subject}</div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmSendModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendOrDraft}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
              >
                {confirmSendModal.actionType === 'send' ? 'Confirm & Send' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
