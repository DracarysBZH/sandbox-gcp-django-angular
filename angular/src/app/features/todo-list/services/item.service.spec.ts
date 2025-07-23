import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ItemService } from './item.service';
import { Item } from '../models/interfaces/item';
import { provideHttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { CreateItem } from '../models/interfaces/create-item';
import { AppConfigService } from 'app/core/services/app-config.service';

describe('ItemService', () => {
  let service: ItemService;
  let httpMock: HttpTestingController;

  const API_URL = `${environment.apiUrl}/todo/items`;
  const TODO_ITEMS_URL = `${API_URL}/todo/items`;

  const mockAppConfigService = {
    apiUrl: API_URL,
  };

  const mockItems: Item[] = [
    {
      id: '1',
      title: 'Todo - Item 1',
      description: 'Description 1',
      is_done: false,
      created_at: new Date('2025/06/17'),
    },
    {
      id: '2',
      title: 'Done - Item 2',
      description: 'Description 2',
      is_done: true,
      created_at: new Date('2025/06/17'),
    },
    {
      id: '3',
      title: 'Todo - Item 3',
      description: 'Description 3',
      is_done: false,
      created_at: new Date('2025/03/17'),
    },
    {
      id: '4',
      title: 'Done - Item 4',
      description: 'Description 4',
      is_done: true,
      created_at: new Date('2025/04/17'),
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ItemService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    });

    service = TestBed.inject(ItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('toDoItems', () => {
    it('should filter and sort todo items correctly', () => {
      service.items.set(mockItems);

      const result = service.toDoItems();
      expect(result.length).toBe(2);
      expect(result[0]).toBe(mockItems[0]);
      expect(result[1]).toBe(mockItems[2]);
    });
  });

  describe('doneItems', () => {
    it('should filter and sort done items correctly', () => {
      service.items.set(mockItems);

      const result = service.doneItems();
      expect(result.length).toBe(2);
      expect(result[0]).toBe(mockItems[1]);
      expect(result[1]).toBe(mockItems[3]);
    });
  });

  describe('getAllItems', () => {
    it('should return a list of item', () => {
      service.getAllItems().subscribe((response: Item[]) => {
        expect(response).toEqual(mockItems);
        expect(response.length).toBe(4);
      });

      const req = httpMock.expectOne(TODO_ITEMS_URL);
      expect(req.request.url).toBe(TODO_ITEMS_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockItems);

      httpMock.verify();
    });
  });

  describe('createItem', () => {
    it('should create an item and the new item received', () => {
      const createItem: CreateItem = {
        title: 'New Item',
        description: 'New Description',
      };

      const exceptedCreatedItem: Item = {
        id: '3',
        title: 'New Item',
        description: 'New Description',
        is_done: false,
        created_at: new Date('2025/06/17'),
      };

      service.createItem(createItem).subscribe((response: Item) => {
        expect(response).toEqual(exceptedCreatedItem);
      });

      const req = httpMock.expectOne(TODO_ITEMS_URL);
      expect(req.request.url).toBe(TODO_ITEMS_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createItem);
      req.flush(exceptedCreatedItem);

      httpMock.verify();
    });
  });

  describe('deleteItem', () => {
    it('should delete an item', () => {
      const itemId = '1';

      service.deleteItem(itemId).subscribe((response: void) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${TODO_ITEMS_URL}/${itemId}`);
      expect(req.request.url).toBe(`${TODO_ITEMS_URL}/${itemId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      httpMock.verify();
    });
  });

  describe('updateItem', () => {
    it('should update an item and return the updated item', () => {
      const updateItem: Item = {
        id: '1',
        title: 'Updated Item',
        description: 'Updated Description',
        is_done: true,
        created_at: new Date('2025/06/17'),
      };

      service.updateItem(updateItem).subscribe((response: Item) => {
        expect(response).toEqual(updateItem);
      });

      const req = httpMock.expectOne(TODO_ITEMS_URL);
      expect(req.request.url).toBe(TODO_ITEMS_URL);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateItem);
      req.flush(updateItem);

      httpMock.verify();
    });
  });
});
