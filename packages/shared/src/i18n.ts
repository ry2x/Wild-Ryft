export const SUPPORTED_LOCALES = [
  'ja_JP',
  'en_US',
  'ko_KR',
  'zh_TW',
  'zh_CN'
] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en_US';

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  ja_JP: '日本語',
  en_US: 'English',
  ko_KR: '한국어',
  zh_TW: '繁體中文',
  zh_CN: '简体中文'
};
