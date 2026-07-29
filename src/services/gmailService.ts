import { clearAccessToken } from './googleSheetsAuth';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  from?: string;
  to?: string;
  subject?: string;
  date?: string;
}

function base64UrlEncode(str: string): string {
  // Encode string to UTF-8 bytes first to support all unicode characters safely
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function handleGmailRes(res: Response, defaultMsg: string): Promise<Response> {
  if (!res.ok) {
    let message = defaultMsg;
    try {
      const json = await res.json();
      message = json.error?.message || defaultMsg;
    } catch (_) {
      // ignore
    }
    const lowerMsg = message.toLowerCase();
    if (
      res.status === 401 ||
      lowerMsg.includes('authentication credentials') ||
      lowerMsg.includes('unauthenticated') ||
      lowerMsg.includes('invalid grant') ||
      lowerMsg.includes('invalid_token')
    ) {
      clearAccessToken();
    }
    throw new Error(message);
  }
  return res;
}

export const gmailService = {
  /**
   * Get authenticated user's Gmail profile
   */
  getProfile: async (accessToken: string): Promise<GmailProfile> => {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    await handleGmailRes(res, 'Failed to fetch Gmail profile');
    return res.json();
  },

  /**
   * Send an email via Gmail API
   */
  sendEmail: async (
    accessToken: string,
    to: string,
    subject: string,
    bodyTextOrHtml: string,
    isHtml = true
  ): Promise<{ id: string; threadId: string }> => {
    const contentType = isHtml ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"';
    const emailLines = [
      `To: ${to}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      `Content-Type: ${contentType}`,
      'MIME-Version: 1.0',
      '',
      bodyTextOrHtml
    ];

    const rawMessage = emailLines.join('\r\n');
    const encodedMessage = base64UrlEncode(rawMessage);

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });

    await handleGmailRes(res, 'Failed to send email via Gmail');
    return res.json();
  },

  /**
   * Create a draft email in Gmail
   */
  createDraft: async (
    accessToken: string,
    to: string,
    subject: string,
    bodyTextOrHtml: string,
    isHtml = true
  ): Promise<{ id: string; message: { id: string } }> => {
    const contentType = isHtml ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"';
    const emailLines = [
      `To: ${to}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      `Content-Type: ${contentType}`,
      'MIME-Version: 1.0',
      '',
      bodyTextOrHtml
    ];

    const rawMessage = emailLines.join('\r\n');
    const encodedMessage = base64UrlEncode(rawMessage);

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: { raw: encodedMessage }
      })
    });

    await handleGmailRes(res, 'Failed to create Gmail draft');
    return res.json();
  },

  /**
   * List recent email messages
   */
  listMessages: async (
    accessToken: string,
    maxResults = 10,
    query = ''
  ): Promise<GmailMessageSummary[]> => {
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    await handleGmailRes(res, 'Failed to list Gmail messages');
    const data = await res.json();
    const messagesList: { id: string; threadId: string }[] = data.messages || [];

    // Fetch message headers in parallel
    const summaries = await Promise.all(
      messagesList.map(async (msg) => {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!detailRes.ok) return { id: msg.id, threadId: msg.threadId };
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          
          const getHeader = (name: string) => 
            headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: detail.snippet,
            from: getHeader('From'),
            to: getHeader('To'),
            subject: getHeader('Subject'),
            date: getHeader('Date')
          };
        } catch (_) {
          return { id: msg.id, threadId: msg.threadId };
        }
      })
    );

    return summaries;
  }
};
