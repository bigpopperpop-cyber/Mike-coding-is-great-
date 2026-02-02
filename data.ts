
import { PaymentRecord } from './types.ts';

// Clean slate starting point
export const INITIAL_LEDGER: PaymentRecord[] = [];
export const SETTINGS_KEY = 'mortgage_tracker_settings';
export const DATA_KEY = 'mortgage_tracker_data';

export interface AppSettings {
  initialBalance: number;
  houseNickName: string;
}
