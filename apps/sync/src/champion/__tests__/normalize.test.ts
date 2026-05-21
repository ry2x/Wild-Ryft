import { describe, expect, it } from 'vitest';

import { addIdToWrData, mergeChampionData } from '../normalize.js';
import {
  createDdChampion,
  createDdChampionData,
  createWrHero,
  createWrHeroData
} from './fixtures.js';

describe('addIdToWrData', () => {
  it('Extract ID Garen from poster URL', () => {
    const wrData = createWrHeroData(createWrHero());

    expect(addIdToWrData(wrData)).toEqual([
      {
        ...wrData.heroList['10001'],
        id: 'Garen'
      }
    ]);
  });

  it('Falls back to heroId if URL pattern does not match', () => {
    const wrData = createWrHeroData(
      createWrHero({
        poster: 'https://invalid-url.com/poster.jpg'
      })
    );

    expect(addIdToWrData(wrData)).toEqual([
      {
        ...wrData.heroList['10001'],
        id: '10001'
      }
    ]);
  });

  it('Can convert multiple heroes', () => {
    const wrData = createWrHeroData(
      createWrHero(),
      createWrHero({
        heroId: '10002',
        poster:
          'https://game.gtimg.cn/images/lgamem/act/lrlib/img/Posters/Aatrox_0.jpg'
      }),
      createWrHero({
        heroId: '10003',
        poster: 'https://invalid-url.com/Lux.jpg'
      })
    );

    expect(addIdToWrData(wrData)).toEqual([
      { ...wrData.heroList['10001'], id: 'Garen' },
      { ...wrData.heroList['10002'], id: 'Aatrox' },
      { ...wrData.heroList['10003'], id: '10003' }
    ]);
  });
});

describe('mergeChampionData', () => {
  it('Sets isWr: true if WR data is available', () => {
    const riotData = createDdChampionData(createDdChampion());
    const wrData = addIdToWrData(createWrHeroData(createWrHero()));

    const result = mergeChampionData({
      riotData,
      wrData,
      lang: 'en_US'
    });

    expect(result.masterData).toEqual([
      {
        champion_id: 'Garen',
        championKey: '86',
        championType: 'None',
        isWr: true,
        roles: ['fighter', 'tank'],
        lanes: ['top'],
        isFree: false,
        difficult: 1,
        damage: 2,
        survive: 3,
        utility: 1
      }
    ]);
  });

  it('Sets isWr: false if WR data is not available', () => {
    const riotData = createDdChampionData(createDdChampion());

    const result = mergeChampionData({
      riotData,
      wrData: [],
      lang: 'en_US'
    });

    expect(result.masterData).toEqual([
      {
        champion_id: 'Garen',
        championKey: '86',
        championType: 'None',
        isWr: false,
        roles: ['fighter', 'tank'],
        lanes: [],
        isFree: false,
        difficult: 0,
        damage: 0,
        survive: 0,
        utility: 0
      }
    ]);
  });

  it('Matches regardless of case', () => {
    const riotData = createDdChampionData(createDdChampion({ id: 'Garen' }));
    const wrData = addIdToWrData(
      createWrHeroData(
        createWrHero({
          poster:
            'https://game.gtimg.cn/images/lgamem/act/lrlib/img/Posters/garen_0.jpg'
        })
      )
    );

    const result = mergeChampionData({
      riotData,
      wrData,
      lang: 'en_US'
    });

    expect(result.masterData[0]?.isWr).toBe(true);
  });

  it("Sets isFree: true if isWeekFree === '1'", () => {
    const riotData = createDdChampionData(createDdChampion());
    const wrData = addIdToWrData(
      createWrHeroData(
        createWrHero({
          isWeekFree: '1'
        })
      )
    );

    const result = mergeChampionData({
      riotData,
      wrData,
      lang: 'en_US'
    });

    expect(result.masterData[0]?.isFree).toBe(true);
  });

  it('Converts Chinese lanes "中路;打野" to [mid, jungle]', () => {
    const riotData = createDdChampionData(createDdChampion());
    const wrData = addIdToWrData(
      createWrHeroData(
        createWrHero({
          lane: '中路;打野'
        })
      )
    );

    const result = mergeChampionData({
      riotData,
      wrData,
      lang: 'en_US'
    });

    expect(result.masterData[0]?.lanes).toEqual(['mid', 'jungle']);
  });

  it('Filters out unknown lanes', () => {
    const riotData = createDdChampionData(createDdChampion());
    const wrData = addIdToWrData(
      createWrHeroData(
        createWrHero({
          lane: '中路;謎レーン;打野'
        })
      )
    );

    const result = mergeChampionData({
      riotData,
      wrData,
      lang: 'en_US'
    });

    expect(result.masterData[0]?.lanes).toEqual(['mid', 'jungle']);
  });

  it('Populates textData with locale, name, title, and description correctly', () => {
    const riotChampion = createDdChampion({
      name: 'Garen',
      title: 'The Might of Demacia',
      blurb: 'Demacia first.'
    });

    const result = mergeChampionData({
      riotData: createDdChampionData(riotChampion),
      wrData: [],
      lang: 'ja_JP'
    });

    expect(result.textData).toEqual([
      {
        championId: 'Garen',
        locale: 'ja_JP',
        name: 'Garen',
        title: 'The Might of Demacia',
        description: 'Demacia first.'
      }
    ]);
  });

  it('Lane of no WR champion should set to NO_WR_LANE mapping', () => {
    const riotChampion = createDdChampion({
      id: 'Anivia',
      name: 'Anivia',
      title: 'The Cryophoenix',
      blurb: 'I am the will of the frozen wastes.'
    });

    const result = mergeChampionData({
      riotData: createDdChampionData(riotChampion),
      wrData: [],
      lang: 'en_US'
    });

    expect(result.masterData[0]?.lanes).toEqual(['mid']);
  });
});
