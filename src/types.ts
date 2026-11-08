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
