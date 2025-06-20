export type Entry = {
  url: string;
  title: string;
  category: string;
  updatedAt: string;
  bodyText?: string;
};

export type GroupedEntries = Record<string, Entry[]>;
