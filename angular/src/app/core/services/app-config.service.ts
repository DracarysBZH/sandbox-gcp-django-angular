import { Injectable } from '@angular/core';
import { Config } from '../models/interfaces/config';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config: Config | undefined;

  async loadConfig() {
    const res = await fetch('/assets/config.json');
    const config = await res.json();
    this.config = config;
  }

  get apiUrl(): string {
    return this.config?.apiUrl ?? '';
  }
}
