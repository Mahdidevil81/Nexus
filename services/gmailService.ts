import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebaseService';
import firebaseConfig from '../firebase-applet-config.json';

export const WORKSPACE_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

export const GMAIL_SCOPES = WORKSPACE_SCOPES;

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

// In-memory token cache (NEVER stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  internalDate: string;
  isUnread: boolean;
  labels: string[];
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText: string;
  bodyHtml?: string;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('mock')) {
    const errorMsg = 'Google authentication requires a configured API key. Please configure your project credentials in Google Cloud or enter an access token directly.';
    console.warn('Google Sign In:', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from authentication.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('api-key-not-valid')) {
      console.warn('Google Sign In: Firebase API key is currently not active or valid in Google Cloud Console.');
    } else {
      console.warn('Google Sign In notice:', error?.message || error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setManualAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGmail = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Base64 URL safe encoder
function createEmailRaw(to: string, subject: string, body: string): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    body
  ];
  const email = emailLines.join('\r\n');
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const listGmailMessages = async (query = '', maxResults = 15): Promise<GmailMessageSummary[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set('maxResults', String(maxResults));
  if (query.trim()) {
    url.searchParams.set('q', query.trim());
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch messages (${response.status})`);
  }

  const data = await response.json();
  const messageRefs: { id: string; threadId: string }[] = data.messages || [];

  // Fetch summaries in parallel (up to 15)
  const summaries = await Promise.all(
    messageRefs.map(async (ref) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${ref.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!detailRes.ok) return null;
        const msg = await detailRes.json();
        const headers: { name: string; value: string }[] = msg.payload?.headers || [];
        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
        const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
        const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
        const isUnread = (msg.labelIds || []).includes('UNREAD');

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet || '',
          subject,
          from,
          to,
          date,
          internalDate: msg.internalDate || '',
          isUnread,
          labels: msg.labelIds || [],
        } as GmailMessageSummary;
      } catch (err) {
        console.warn(`Failed to fetch message summary for ${ref.id}:`, err);
        return null;
      }
    })
  );

  return summaries.filter((s): s is GmailMessageSummary => s !== null);
};

export const getGmailMessageDetail = async (messageId: string): Promise<GmailMessageDetail> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch message details (${response.status})`);
  }

  const msg = await response.json();
  const headers: { name: string; value: string }[] = msg.payload?.headers || [];
  const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
  const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
  const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
  const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
  const isUnread = (msg.labelIds || []).includes('UNREAD');

  let bodyText = '';
  let bodyHtml = '';

  const extractBody = (part: any) => {
    if (!part) return;
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText = decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml = decodeBase64Url(part.body.data);
    }
    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(extractBody);
    }
  };

  extractBody(msg.payload);
  if (!bodyText && bodyHtml) {
    // Basic fallback to text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyHtml;
    bodyText = tempDiv.textContent || tempDiv.innerText || '';
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet || '',
    subject,
    from,
    to,
    date,
    internalDate: msg.internalDate || '',
    isUnread,
    labels: msg.labelIds || [],
    bodyText: bodyText || msg.snippet || '(No text content)',
    bodyHtml,
  };
};

export const sendGmailMessage = async (to: string, subject: string, body: string): Promise<{ id: string; threadId: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const raw = createEmailRaw(to, subject, body);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to send email (${response.status})`);
  }

  return await response.json();
};

export const trashGmailMessage = async (messageId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to move message to trash (${response.status})`);
  }
};

function decodeBase64Url(base64UrlStr: string): string {
  try {
    let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (err) {
    console.warn('Failed to decode base64url content:', err);
    return '';
  }
}
