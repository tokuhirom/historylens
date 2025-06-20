export type ActivityEntry = {
  id?: string; // content.ts で生成。background.ts 側では省略可
  url: string;
  title: string;
  category: string;
  updatedAt?: string; // background.ts 側で付与
  firstSeenAt?: string; // background.ts 側で付与
  timestamp?: string; // content.ts 側で生成（初回記録時刻）
  bodyText?: string;
};

export type LogActivityMessage = {
  type: 'log-activity';
  entry: ActivityEntry;
};

export type LogActivityResponse = {
  status: 'ok' | 'error' | 'skipped';
  error?: unknown;
};

export type UrlPattern = {
  pattern: string;
  category: string; // Changed from 'type' to 'category' for customizable labels
};

export type DomainConfig = UrlPattern[];
