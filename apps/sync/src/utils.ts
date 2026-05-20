import axios, { AxiosResponse } from 'axios';
import { SyncError } from './error.js';

export async function fetchData<T>(url: string): Promise<AxiosResponse<T>> {
  try {
    return await axios.get<T>(url);
  } catch (err) {
    throw new SyncError(
      `Failed to fetch data from ${url}`,
      'FETCH_ERROR',
      true,
      { cause: err }
    );
  }
}
