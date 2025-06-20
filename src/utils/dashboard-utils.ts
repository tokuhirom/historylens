import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return format(date, 'yyyy-MM-dd(EEE) HH:mm', { locale: enUS });
};

export const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export const getCategoryIcon = (category: string) => {
  // Extract emoji from category if it starts with one
  const emojiMatch = category.match(
    /^([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u
  );
  if (emojiMatch) {
    return emojiMatch[1];
  }
  return '📄';
};

export const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    // Using DuckDuckGo's favicon service as it's more reliable and doesn't require API keys
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    return null;
  }
};
