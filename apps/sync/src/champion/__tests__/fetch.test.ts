import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchData } from '../../utils.js';
import { fetchChampionData, fetchDDVersion } from '../fetch.js';

vi.mock('../../utils.js', () => ({
  fetchData: vi.fn()
}));

const mockFetchData = vi.mocked(fetchData);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchDDVersion', () => {
  it('Returns the first version', async () => {
    mockFetchData.mockResolvedValueOnce({
      data: ['16.10.1', '16.10.0']
    } as Awaited<ReturnType<typeof fetchData>>);

    await expect(fetchDDVersion('https://example.com/versions')).resolves.toBe(
      '16.10.1'
    );
    expect(mockFetchData).toHaveBeenCalledWith('https://example.com/versions');
  });
});

describe('fetchChampionData', () => {
  it('Replaces {version} and {lang} in the URL and fetches data', async () => {
    const payload = {
      type: 'champion',
      format: 'standAloneComplex',
      version: '16.10.1',
      data: {}
    };

    mockFetchData.mockResolvedValueOnce({
      data: payload
    } as Awaited<ReturnType<typeof fetchData>>);

    await expect(
      fetchChampionData({
        ddVersion: '16.10.1',
        ddChampionApi:
          'https://example.com/cdn/{version}/data/{lang}/champion.json',
        lang: 'ja_JP'
      })
    ).resolves.toEqual(payload);

    expect(mockFetchData).toHaveBeenCalledWith(
      'https://example.com/cdn/16.10.1/data/ja_JP/champion.json'
    );
  });
});
