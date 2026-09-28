import { getAccessToken } from './gmailService';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  owners?: { displayName: string; emailAddress: string }[];
  shared?: boolean;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3/files';

/**
 * List files and folders from the user's Google Drive
 */
export const listDriveFiles = async (query = '', pageSize = 30): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google to access Google Drive.');
  }

  const url = new URL(DRIVE_API_BASE);
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set(
    'fields',
    'nextPageToken,files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,createdTime,modifiedTime,size,owners,shared)'
  );
  url.searchParams.set('orderBy', 'modifiedTime desc');
  
  // Non-trashed filter
  let qFilter = 'trashed = false';
  if (query.trim()) {
    // Escape single quotes in search query
    const escaped = query.trim().replace(/'/g, "\\'");
    qFilter += ` and name contains '${escaped}'`;
  }
  url.searchParams.set('q', qFilter);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Drive files (${response.status})`);
  }

  const data = await response.json();
  return (data.files || []) as DriveFile[];
};

/**
 * Create a new folder in Google Drive
 * Note: Caller UI MUST show a confirmation dialog before executing mutations.
 */
export const createDriveFolder = async (folderName: string): Promise<DriveFile> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const metadata = {
    name: folderName.trim(),
    mimeType: 'application/vnd.google-apps.folder',
  };

  const response = await fetch(DRIVE_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create folder (${response.status})`);
  }

  return (await response.json()) as DriveFile;
};

/**
 * Upload a text or JSON document directly to Google Drive
 * Note: Caller UI MUST show a confirmation dialog before executing mutations.
 */
export const uploadDriveTextFile = async (
  fileName: string,
  content: string,
  mimeType = 'text/plain'
): Promise<DriveFile> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName.trim(),
    mimeType: mimeType,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const url = `${DRIVE_UPLOAD_BASE}?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to upload file to Google Drive (${response.status})`);
  }

  return (await response.json()) as DriveFile;
};

/**
 * Delete a file or folder from Google Drive
 * Note: Caller UI MUST show an explicit confirmation dialog before executing destructive operations.
 */
export const deleteDriveFile = async (fileId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const url = `${DRIVE_API_BASE}/${encodeURIComponent(fileId)}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete file from Google Drive (${response.status})`);
  }
};
