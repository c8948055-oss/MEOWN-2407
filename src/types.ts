export type TabId = 'history' | 'geography' | 'species' | 'economy' | 'systems';

export interface TabContent {
  id: TabId;
  title: string;
  subtitle: string;
  summary: string;
  highlights: string[];
  htmlFileUrl?: string;
  htmlContent?: string;
  videoUrl?: string;
  lastUpdated: string;
  version: number;
  isCustomUpload?: boolean;
  uploadedFilename?: string;
  lastBackupId?: string;
}

export interface BackupRecord {
  id: string;
  tabId: string;
  filename: string;
  originalName: string;
  timestamp: string;
  size: number;
  url: string;
  title?: string;
}

export type AllContent = Record<TabId, TabContent>;

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: string;
  isCustom?: boolean;
  addedAt: string;
}

export interface TabConfig {
  id: TabId;
  name: string;
  shortName: string;
  code: string;
  accent: string;
  description: string;
}
