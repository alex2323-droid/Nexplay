import { RechargeProvider } from './RechargeProvider';
import { MockProvider } from './MockProvider';
import { dbStore } from '../store';

const mockProviderInstance = new MockProvider();

export class ProviderFactory {
  static getProvider(): RechargeProvider {
    // If activeProvider is set to mock or testMode is enabled, use MockProvider
    if (dbStore.settings.testMode || dbStore.settings.activeProvider === 'mock') {
      return mockProviderInstance;
    }

    // Default back to mock if real provider not fully implemented
    return mockProviderInstance;
  }
}
