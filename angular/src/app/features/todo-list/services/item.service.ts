import {
  computed,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/interfaces/item';
import { CreateItem } from '../models/interfaces/create-item';
import { AppConfigService } from 'app/core/services/app-config.service';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get API_URL(): string {
    return `${this.config.apiUrl}/todo/items`;
  }

  items: WritableSignal<Item[]> = signal<Item[]>([]);

  toDoItems: Signal<Item[]> = computed(() =>
    this.items()
      .filter((item: Item) => !item.is_done)
      .sort(
        (a: Item, b: Item) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  );

  doneItems: Signal<Item[]> = computed(() =>
    this.items()
      .filter((item: Item) => item.is_done)
      .sort(
        (a: Item, b: Item) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  );

  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.API_URL);
  }

  createItem(item: CreateItem): Observable<Item> {
    return this.http.post<Item>(this.API_URL, item);
  }

  deleteItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${itemId}`);
  }

  updateItem(item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.API_URL}`, item);
  }
}
