import { localStorageService } from './localStorageService';
import { getAccessToken, clearAccessToken } from './googleSheetsAuth';
import { format } from 'date-fns';

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime?: string;
}

export interface DriveBackupConfig {
  enabled: boolean;
  folderId: string;
  folderName: string;
  intervalMinutes: number; // default 1440 (24 hours)
  lastBackupTime: string | null;
  lastBackupTimestamp: number | null;
}

const STORAGE_KEY = 'gdrive_recurring_backup_config_v1';

async function handleDriveRes(res: Response, defaultMsg: string): Promise<Response> {
  if (!res.ok) {
    let message = defaultMsg;
    try {
      const json = await res.json();
      message = json.error?.message || defaultMsg;
    } catch (_) {
      // fallback
    }
    if (res.status === 401 || message.toLowerCase().includes('unauthenticated') || message.toLowerCase().includes('invalid')) {
      clearAccessToken();
    }
    throw new Error(message);
  }
  return res;
}

export const googleDriveBackupService = {
  /**
   * Get the current recurring backup configuration from localStorage
   */
  getConfig(): DriveBackupConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          enabled: Boolean(parsed.enabled),
          folderId: parsed.folderId || '',
          folderName: parsed.folderName || '',
          intervalMinutes: Number(parsed.intervalMinutes) || 1440,
          lastBackupTime: parsed.lastBackupTime || null,
          lastBackupTimestamp: parsed.lastBackupTimestamp || null,
        };
      }
    } catch (e) {
      console.error('Error reading Drive backup config:', e);
    }
    return {
      enabled: false,
      folderId: '',
      folderName: '',
      intervalMinutes: 1440, // default 24 hours
      lastBackupTime: null,
      lastBackupTimestamp: null,
    };
  },

  /**
   * Save recurring backup configuration
   */
  saveConfig(config: Partial<DriveBackupConfig>): DriveBackupConfig {
    const current = this.getConfig();
    const updated: DriveBackupConfig = {
      ...current,
      ...config,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving Drive backup config:', e);
    }
    return updated;
  },

  /**
   * List folders in connected user's Google Drive
   */
  async listFolders(accessToken: string): Promise<DriveFolder[]> {
    try {
      const q = encodeURIComponent("mimeType='application/vnd.google-apps.folder' and trashed=false");
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      await handleDriveRes(res, 'Failed to list Google Drive folders');
      const data = await res.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listing Drive folders:', error);
      throw error;
    }
  },

  /**
   * Create a new folder in Google Drive
   */
  async createFolder(
    accessToken: string,
    folderName: string = 'Cellular & Repair Backups'
  ): Promise<DriveFolder> {
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });
      await handleDriveRes(res, 'Failed to create Google Drive folder');
      const data = await res.json();
      return {
        id: data.id,
        name: data.name || folderName,
      };
    } catch (error) {
      console.error('Error creating Drive folder:', error);
      throw error;
    }
  },

  /**
   * Upload a JSON backup file to a specific Google Drive folder
   */
  async uploadJsonBackup(
    accessToken: string,
    folderId: string,
    backupData: any,
    filename?: string
  ): Promise<{ fileId: string; fileName: string }> {
    const name =
      filename ||
      `All_Cellular_Backup_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`;
    const jsonString = JSON.stringify(backupData, null, 2);

    // Step 1: Create file metadata
    const metadataRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/json',
        parents: [folderId],
      }),
    });
    await handleDriveRes(metadataRes, 'Failed to create backup file in Google Drive');
    const { id: fileId } = await metadataRes.json();

    // Step 2: Upload file content
    const uploadRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: jsonString,
      }
    );
    await handleDriveRes(uploadRes, 'Failed to upload backup JSON content');

    return {
      fileId,
      fileName: name,
    };
  },

  /**
   * Immediately execute a backup of all local database data to Google Drive
   */
  async runBackupNow(
    accessToken?: string
  ): Promise<{ success: boolean; message: string; timestamp: string }> {
    const token = accessToken || getAccessToken();
    if (!token) {
      throw new Error('Google Account not connected or access token expired. Please connect your Google account in Settings.');
    }

    const config = this.getConfig();
    if (!config.folderId) {
      throw new Error('No Google Drive folder selected for backup. Please choose or create a backup folder in Settings.');
    }

    const dbData = localStorageService.exportFullDatabase();
    const { fileName } = await this.uploadJsonBackup(token, config.folderId, dbData);

    const nowStr = format(new Date(), 'MMM dd, yyyy HH:mm');
    const timestamp = Date.now();

    this.saveConfig({
      lastBackupTime: nowStr,
      lastBackupTimestamp: timestamp,
    });

    return {
      success: true,
      message: `Silent backup successfully uploaded to Google Drive folder "${config.folderName || 'Selected Folder'}" (${fileName})`,
      timestamp: nowStr,
    };
  },

  /**
   * Background check: runs a silent backup if enabled and the schedule interval has elapsed
   */
  async checkAndRunSilentBackup(): Promise<{ ran: boolean; success?: boolean; message?: string }> {
    const config = this.getConfig();
    if (!config.enabled || !config.folderId) {
      return { ran: false };
    }

    const token = getAccessToken();
    if (!token) {
      return { ran: false };
    }

    const now = Date.now();
    const intervalMs = (config.intervalMinutes || 1440) * 60 * 1000;
    const lastRun = config.lastBackupTimestamp || 0;

    // Check if interval has elapsed since last backup
    if (now - lastRun >= intervalMs) {
      try {
        const result = await this.runBackupNow(token);
        console.log('[Google Drive Recurring Silent Backup] Complete:', result.message);
        return { ran: true, success: true, message: result.message };
      } catch (err: any) {
        console.warn('[Google Drive Recurring Silent Backup] Failed:', err);
        return { ran: true, success: false, message: err?.message || 'Silent backup failed' };
      }
    }

    return { ran: false };
  },
};
