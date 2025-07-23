import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';
import { Config } from '../models/interfaces/config';

describe('AppConfigService', () => {
  let service: AppConfigService;

  const mockConfig: Config = { apiUrl: 'http://mock-api.com' };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppConfigService);
  });

  describe('loadConfig', () => {
    it('should fetch and set the config', async () => {
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          json: () => Promise.resolve(mockConfig),
        } as Response)
      );

      await service.loadConfig();

      expect(window.fetch).toHaveBeenCalledWith('/assets/config.json');
      expect(service.apiUrl).toBe(mockConfig.apiUrl);
    });
  });

  describe('apiUrl getter', () => {
    it('should return empty string if config is undefined', () => {
      expect(service.apiUrl).toBe('');
    });

    it('should return apiUrl from config if set', async () => {
      (service as unknown as { config: Config }).config = mockConfig;
      expect(service.apiUrl).toBe(mockConfig.apiUrl);
    });
  });
});
