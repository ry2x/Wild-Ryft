import { DDChampion, DDChampionData } from '../../types/ddApi.js';
import { WRHero, WRHeroData } from '../../types/wrHeroApi.js';

export function createWrHero(overrides: Partial<WRHero> = {}): WRHero {
  return {
    heroId: '10001',
    name: '盖伦',
    title: '德玛西亚之力',
    roles: ['战士'],
    lane: '单人路',
    intro: '“德玛西亚之力”盖伦加入你的队伍',
    avatar: 'https://example.com/avatar.png',
    card: 'https://example.com/card.png',
    poster:
      'https://game.gtimg.cn/images/lgamem/act/lrlib/img/Posters/Garen_0.jpg',
    highlightprice: '5500',
    couponprice: '450',
    alias: 'gailun',
    tags: '',
    searchkey: '',
    isWeekFree: '0',
    difficultyL: '1',
    damage: '2',
    surviveL: '3',
    assistL: '1',
    ...overrides
  };
}

export function createWrHeroData(...heroes: WRHero[]): WRHeroData {
  return {
    heroList: Object.fromEntries(heroes.map((hero) => [hero.heroId, hero]))
  };
}

export function createDdChampion(
  overrides: Partial<DDChampion> = {}
): DDChampion {
  return {
    version: '16.10.1',
    id: 'Garen',
    key: '86',
    name: 'Garen',
    title: 'The Might of Demacia',
    blurb: 'A proud and noble warrior.',
    info: { attack: 7, defense: 7, magic: 1, difficulty: 5 },
    image: {
      full: 'Garen.png',
      sprite: 'champion1.png',
      group: 'champion',
      x: 0,
      y: 0,
      w: 48,
      h: 48
    },
    tags: ['fighter', 'tank'],
    partype: 'None',
    stats: {
      hp: 690,
      hpperlevel: 98,
      mp: 0,
      mpperlevel: 0,
      movespeed: 340,
      armor: 38,
      armorperlevel: 4.2,
      spellblock: 32,
      spellblockperlevel: 1.55,
      attackrange: 175,
      hpregen: 8,
      hpregenperlevel: 0.5,
      mpregen: 0,
      mpregenperlevel: 0,
      crit: 0,
      critperlevel: 0,
      attackdamage: 69,
      attackdamageperlevel: 0,
      attackspeedperlevel: 3.65,
      attackspeed: 0.625
    },
    ...overrides
  };
}

export function createDdChampionData(
  ...champions: DDChampion[]
): DDChampionData {
  return {
    type: 'champion',
    format: 'standAloneComplex',
    version: '16.10.1',
    data: Object.fromEntries(
      champions.map((champion) => [champion.id, champion])
    )
  };
}
