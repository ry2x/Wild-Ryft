import { createInstance, type TFunction } from 'i18next';

import {
  SUPPORTED_LOCALES,
  type Lane,
  type Rank,
  type Role,
  type SupportedLocale
} from '@wild-ryft/shared';

const WEB_DEFAULT_LOCALE: SupportedLocale = 'ja_JP';

const enUS = {
  layout: {
    overview: 'Overview',
    explore: 'Explore',
    tiers: 'Meta Tiers',
    analytics: 'Analytics',
    profile: 'Profile',
    metaDescription:
      'Mobile-first match history and tier lists for League of Legends: Wild Rift.'
  },
  common: {
    all: 'All',
    lanes: {
      all: 'ALL',
      top: 'Baron',
      jungle: 'Jungle',
      mid: 'Mid',
      bot: 'Duo',
      support: 'Support'
    },
    roles: {
      fighter: 'Fighter',
      mage: 'Mage',
      assassin: 'Assassin',
      marksman: 'Marksman',
      support: 'Support',
      tank: 'Tank'
    },
    ranks: {
      all: 'All Ranks',
      diamond: 'Diamond+',
      master_plus: 'Master+',
      challenger: 'Challenger',
      super_server: 'Super Server'
    },
    metrics: {
      score: 'Score',
      winRate: 'Win Rate',
      winRateShort: 'WR'
    },
    misc: {
      wildRiftChampion: 'Wild Rift Champion',
      favorite: 'Favorite'
    }
  },
  pages: {
    home: {
      title: 'Meta Overview',
      subtitle: 'Latest stats, match history, and champion tier lists',
      totalChamps: 'Tracked Champions',
      opTierCount: 'OP Tier Count',
      avgWr: 'Avg Win Rate',
      lastUpdate: 'Last Update',
      topMetaTitle: 'Top Meta',
      winnersTitle: 'Patch Winners (Momentum)',
      losersTitle: 'Patch Losers (Momentum)',
      empty: 'No data found. Please run the DB seed script.'
    },
    explore: {
      title: 'Explore Champions',
      header: 'Champions',
      desc: 'Explore stats and details for all Wild Rift champions.'
    },
    tiers: {
      title: 'Meta Tier List',
      header: 'Tier List',
      desc: 'Champion tiers and match statistics for the current patch.',
      tableChamp: 'Champion',
      tableTier: 'Tier',
      tableScore: 'Score',
      tableWr: 'Win Rate',
      tablePr: 'Pick Rate',
      tableBr: 'Ban Rate',
      tableMmt: 'Momentum',
      empty: 'No records found.'
    },
    analytics: {
      title: 'Momentum & Analytics',
      header: 'Meta Analytics',
      desc: 'Visually compare patch trends and win rate momentum for top-performing champions.'
    },
    profile: {
      title: 'Settings & Profile',
      header: 'Profile Settings',
      langTitle: 'Language Preferences',
      langDesc: 'Switch the display language for champion names and descriptions.',
      favTitle: 'Manage Favorites',
      favDesc: 'View and remove champions from your favorites list.',
      clearAll: 'Clear All',
      noFavs: 'No favorites added yet.',
      prefTitle: 'App Preferences',
      prefDesc: 'Set default ranks for lists and dashboard view.',
      defaultRankLabel: 'Default Rank Filter',
      removeBtn: 'Remove'
    },
    champion: {
      back: 'Back',
      difficulty: 'Difficulty',
      damage: 'Damage',
      survive: 'Survive',
      utility: 'Utility',
      profile: 'Champion Profile',
      roles: 'Roles',
      recommendedLanes: 'Recommended Lanes',
      performance: 'Current Performance',
      wr: 'Win Rate',
      pr: 'Pick Rate',
      br: 'Ban Rate',
      momentum: 'Momentum',
      trendTitle: 'Win Rate Trend',
      lore: 'Backstory',
      type: 'Resource Type',
      statsRadar: 'Stats Radar'
    }
  },
  components: {
    exploreChampions: {
      searchPlaceholder: 'Search champion...',
      laneLabel: 'Lane',
      roleLabel: 'Role',
      onlyFav: 'Favorites Only',
      noResults: 'No champions found matching criteria'
    },
    analyticsDashboard: {
      chartTitle: 'Win Rate Trend Comparison (Last 10 Days)',
      compTitle: 'Detailed Statistics Comparison',
      selectLabel: 'Select Champions to Compare (Max 5):',
      tableChamp: 'Champion',
      tableLane: 'Lane',
      tableTier: 'Tier',
      tableWr: 'Latest WR',
      tablePr: 'Pick Rate',
      tableBr: 'Ban Rate'
    }
  }
};

const jaJP: typeof enUS = {
  layout: {
    overview: '概要',
    explore: '探索',
    tiers: 'メタティア',
    analytics: '分析',
    profile: '設定',
    metaDescription:
      'League of Legends: Wild Rift 向けのモバイルファーストな戦績・ティアリストサイト。'
  },
  common: {
    all: 'すべて',
    lanes: {
      all: 'ALL',
      top: 'バロン',
      jungle: 'ジャングル',
      mid: 'ミッド',
      bot: 'デュオ',
      support: 'サポート'
    },
    roles: {
      fighter: 'ファイター',
      mage: 'メイジ',
      assassin: 'アサシン',
      marksman: 'マークスマン',
      support: 'サポート',
      tank: 'タンク'
    },
    ranks: {
      all: '全ランク',
      diamond: 'ダイヤモンド+',
      master_plus: 'マスター+',
      challenger: 'チャレンジャー',
      super_server: 'スーパーサーバー'
    },
    metrics: {
      score: 'スコア',
      winRate: '勝率',
      winRateShort: '勝率'
    },
    misc: {
      wildRiftChampion: 'Wild Rift Champion',
      favorite: 'お気に入り'
    }
  },
  pages: {
    home: {
      title: 'メタ概要',
      subtitle: '最新の統計、戦績、チャンピオンティアリストを確認できます',
      totalChamps: '対象チャンピオン',
      opTierCount: 'OPランク数',
      avgWr: '平均勝率',
      lastUpdate: '最終更新',
      topMetaTitle: 'トップメタ',
      winnersTitle: 'パッチの勝ち組 (モメンタム)',
      losersTitle: 'パッチの負け組 (モメンタム)',
      empty: 'データが見つかりません。DB の seed を実行してください。'
    },
    explore: {
      title: 'チャンピオン探索',
      header: 'チャンピオン',
      desc: '全チャンピオンのデータを確認してお気に入りを見つけましょう。'
    },
    tiers: {
      title: 'メタティアリスト',
      header: 'ティアリスト',
      desc: '現在のパッチにおけるチャンピオンの強さと統計情報。',
      tableChamp: 'チャンピオン',
      tableTier: 'ティア',
      tableScore: 'スコア',
      tableWr: '勝率',
      tablePr: 'ピック率',
      tableBr: 'BAN率',
      tableMmt: 'モメンタム',
      empty: '該当するデータがありません。'
    },
    analytics: {
      title: 'モメンタム & 分析',
      header: 'メタ分析',
      desc: 'トップチャンピオンのパッチ動向とモメンタムの推移をビジュアルで比較します。'
    },
    profile: {
      title: '設定 & プロファイル',
      header: 'プロファイル設定',
      langTitle: '表示言語の設定',
      langDesc: 'サイト内のチャンピオン名や説明の言語を切り替えます。',
      favTitle: 'お気に入りの管理',
      favDesc: 'お気に入りに登録したチャンピオンを編集・削除できます。',
      clearAll: 'すべてクリア',
      noFavs: 'お気に入りは登録されていません。',
      prefTitle: 'デフォルト設定',
      prefDesc: 'ティアリストなどの初期表示ランクを設定します。',
      defaultRankLabel: '初期ランク設定',
      removeBtn: '削除'
    },
    champion: {
      back: '戻る',
      difficulty: '難易度',
      damage: 'ダメージ',
      survive: '耐久力',
      utility: 'ユーティリティ',
      profile: 'プロフィール',
      roles: '役割',
      recommendedLanes: '推奨レーン',
      performance: '現在のパフォーマンス',
      wr: '勝率',
      pr: 'ピック率',
      br: 'BAN率',
      momentum: 'モメンタム',
      trendTitle: '勝率トレンド',
      lore: 'バックストーリー',
      type: 'リソースタイプ',
      statsRadar: 'ステータスレーダー'
    }
  },
  components: {
    exploreChampions: {
      searchPlaceholder: 'チャンピオンを検索...',
      laneLabel: 'レーン',
      roleLabel: 'ロール',
      onlyFav: 'お気に入りのみ',
      noResults: '条件に合うチャンピオンが見つかりません'
    },
    analyticsDashboard: {
      chartTitle: '勝率トレンド比較 (過去10日間)',
      compTitle: '詳細統計比較',
      selectLabel: '比較するチャンピオンを選択 (最大5体):',
      tableChamp: 'チャンピオン',
      tableLane: 'レーン',
      tableTier: 'ティア',
      tableWr: '最新勝率',
      tablePr: 'ピック率',
      tableBr: 'BAN率'
    }
  }
};

const resources = {
  ja_JP: { translation: jaJP },
  en_US: { translation: enUS },
  ko_KR: { translation: enUS },
  zh_TW: { translation: enUS },
  zh_CN: { translation: enUS }
} as const;

export function resolveLocale(locale?: string): SupportedLocale {
  if (locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    return locale as SupportedLocale;
  }
  return WEB_DEFAULT_LOCALE;
}

export async function getI18n(localeInput?: string) {
  const locale = resolveLocale(localeInput);
  const instance = createInstance();

  await instance.init({
    lng: locale,
    fallbackLng: WEB_DEFAULT_LOCALE,
    resources,
    interpolation: { escapeValue: false }
  });

  return {
    locale,
    t: instance.getFixedT(locale)
  };
}

export function getLaneLabels(t: TFunction): Record<Lane, string> {
  return {
    top: t('common.lanes.top'),
    jungle: t('common.lanes.jungle'),
    mid: t('common.lanes.mid'),
    bot: t('common.lanes.bot'),
    support: t('common.lanes.support')
  };
}

export function getRoleLabels(t: TFunction): Record<Role, string> {
  return {
    fighter: t('common.roles.fighter'),
    mage: t('common.roles.mage'),
    assassin: t('common.roles.assassin'),
    marksman: t('common.roles.marksman'),
    support: t('common.roles.support'),
    tank: t('common.roles.tank')
  };
}

export function getRankLabels(
  t: TFunction
): Record<Rank | 'all', string> {
  return {
    all: t('common.ranks.all'),
    diamond: t('common.ranks.diamond'),
    master_plus: t('common.ranks.master_plus'),
    challenger: t('common.ranks.challenger'),
    super_server: t('common.ranks.super_server')
  };
}

export function getLanguageTag(locale: SupportedLocale): string {
  return locale.replace('_', '-');
}
