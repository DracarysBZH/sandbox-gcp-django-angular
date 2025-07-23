import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { TodoListComponent } from './todo-list.component';
import { ItemService } from '@features/todo-list/services/item.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Item } from '@features/todo-list/models/interfaces/item';
import { delay, of, switchMap, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DebugElement, signal, WritableSignal } from '@angular/core';
import { CreateItemComponent } from '../create-item/create-item.component';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('TodoListComponent', () => {
  let fixture: ComponentFixture<TodoListComponent>;

  let mockItemService: jasmine.SpyObj<ItemService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockItemsSignal: WritableSignal<Item[]> = signal<Item[]>([]);
  const mockTodoSignal: WritableSignal<Item[]> = signal<Item[]>([]);
  const mockDoneSignal: WritableSignal<Item[]> = signal<Item[]>([]);

  const mockItems: Item[] = [
    {
      id: '1',
      title: 'Tâche TODO',
      description: 'Description TODO',
      is_done: false,
      created_at: new Date('2023-01-01T00:00:00Z'),
    },
    {
      id: '2',
      title: 'Tâche DONE',
      description: 'Description DONE',
      is_done: true,
      created_at: new Date('2023-01-02T00:00:00Z'),
    },
  ];

  beforeEach(async () => {
    spyOn(mockItemsSignal, 'update').and.callThrough();
    mockItemService = jasmine.createSpyObj(
      'ItemService',
      ['getAllItems', 'updateItem'],
      {
        items: mockItemsSignal,
        toDoItems: mockTodoSignal,
        doneItems: mockDoneSignal,
      }
    );
    mockItemService.getAllItems.and.returnValue(of(mockItems));
    mockDialog = jasmine.createSpyObj('MatDialog', ['open'], {
      _openDialogs: [],
    });
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [TodoListComponent, ScrollingModule],
      providers: [
        { provide: ItemService, useValue: mockItemService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    })
      .overrideComponent(TodoListComponent, {
        remove: {
          imports: [MatDialogModule],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    expect(mockItemService.getAllItems).toHaveBeenCalled();
  });

  describe('Loading', () => {
    const spinnerSelector = 'mat-spinner';

    beforeEach(() => {
      spyOn(mockItemsSignal, 'set').and.callThrough();
    });

    it('should display loading spinner at start and remove it after load', fakeAsync(() => {
      mockItemService.getAllItems.and.returnValue(
        of(mockItems).pipe(delay(100))
      );

      fixture = TestBed.createComponent(TodoListComponent);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css(spinnerSelector))
      ).not.toBeNull();

      tick(100);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css(spinnerSelector))).toBeNull();
      expect(mockItemsSignal.set).toHaveBeenCalledWith(mockItems);
    }));

    it('should handle error when loading items fails', fakeAsync(() => {
      mockItemService.getAllItems.and.returnValue(
        of(null).pipe(
          delay(100),
          switchMap(() => throwError(() => new Error()))
        )
      );

      fixture = TestBed.createComponent(TodoListComponent);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css(spinnerSelector))
      ).not.toBeNull();

      tick(100);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css(spinnerSelector))).toBeNull();
      expect(mockItemsSignal.set).toHaveBeenCalledWith([]);
    }));
  });

  describe('Column TODO and DONE', () => {
    beforeEach(async () => {
      mockTodoSignal.set([mockItems[0]]);
      mockDoneSignal.set([mockItems[1]]);
      fixture.detectChanges();
    });

    it('should display both TODO and DONE columns', () => {
      const columns = fixture.debugElement.queryAll(
        By.css('.todo-list-column')
      );
      expect(columns.length).toBe(2);
    });

    it('should display "TODO" title in first column', () => {
      const todoTitle = fixture.debugElement.query(
        By.css('.todo-list-column:first-child .todo-list-column-title')
      );
      expect(todoTitle.nativeElement.textContent.trim()).toBe('TODO');
    });

    it('should display "DONE" title in second column', () => {
      const doneTitle = fixture.debugElement.query(
        By.css('.todo-list-column:last-child .todo-list-column-title')
      );
      expect(doneTitle.nativeElement.textContent.trim()).toBe('DONE');
    });

    it('should display TODO items in first column', () => {
      const todoItems = fixture.debugElement.queryAll(
        By.css('.todo-list-column:first-child app-item')
      );
      expect(todoItems.length).toBe(1);
      expect(todoItems[0].componentInstance.item).toEqual(mockItems[0]);
    });

    it('should display DONE items in second column', () => {
      const doneItems = fixture.debugElement.queryAll(
        By.css('.todo-list-column:last-child app-item')
      );
      expect(doneItems.length).toBe(1);
      expect(doneItems[0].componentInstance.item).toEqual(mockItems[1]);
    });
  });

  describe('Empty items messages', () => {
    beforeEach(() => {
      mockTodoSignal.set([]);
      mockDoneSignal.set([]);
      fixture.detectChanges();
    });

    it('should display "create an item message" when TODO column is empty', () => {
      const emptyMessage = fixture.debugElement.query(
        By.css('.todo-list-column:first-child .todo-list-empty h4')
      );
      expect(emptyMessage?.nativeElement.textContent.trim()).toBe(
        'Create an Item !'
      );
    });

    it('should display "create an item message" when DONE column is empty', () => {
      const emptyMessage = fixture.debugElement.query(
        By.css('.todo-list-column:last-child .todo-list-empty h4')
      );
      expect(emptyMessage?.nativeElement.textContent.trim()).toBe(
        'Drag an item here !'
      );
    });
  });

  describe('Add button', () => {
    let addButton: DebugElement;
    let addButtonElement: HTMLButtonElement;

    beforeEach(() => {
      addButton = fixture.debugElement.query(By.css('.todo-list-add button'));
      addButtonElement = addButton.nativeElement;
    });

    it('should display add button with "add" icon', () => {
      const addIcon = addButton.query(By.css('mat-icon'));

      expect(addButtonElement).not.toBeNull();
      expect(addIcon.nativeElement.textContent.trim()).toBe('add');
    });

    it('should open create item modal when clicking on add button', async () => {
      addButtonElement.click();
      fixture.detectChanges();

      expect(mockDialog.open).toHaveBeenCalledWith(CreateItemComponent, {
        minWidth: '38rem',
      });
    });
  });

  describe('Drag and drop', () => {
    let todoColumn: DebugElement;

    beforeEach(async () => {
      mockItemsSignal.set(mockItems);
      mockTodoSignal.set([mockItems[0]]);
      mockDoneSignal.set([mockItems[1]]);
      fixture.detectChanges();
      todoColumn = fixture.debugElement.query(
        By.css('.todo-list-column:first-child [cdkDropList]')
      );
    });

    it('should do nothing when item is dropped in the same container', () => {
      const mockCdkDropList: CdkDropList<Item[]> = {
        data: mockTodoSignal(),
      } as CdkDropList<Item[]>;
      const mockEvent = {
        previousContainer: mockCdkDropList,
        container: mockCdkDropList,
        item: { data: mockItems[0] } as CdkDrag<Item>,
      } as CdkDragDrop<Item[]>;

      todoColumn.triggerEventHandler('cdkDropListDropped', mockEvent);
      fixture.detectChanges();

      expect(mockItemService.updateItem).not.toHaveBeenCalled();
    });

    it('should update item status when drag and drop occurs', () => {
      const mockEvent = {
        previousContainer: { data: mockTodoSignal() } as CdkDropList<Item[]>,
        container: { data: mockDoneSignal() } as CdkDropList<Item[]>,
        item: { data: mockItems[0] } as CdkDrag<Item>,
      } as CdkDragDrop<Item[]>;
      const updatedItem = { ...mockItems[0], is_done: true };

      mockItemService.updateItem.and.returnValue(of(updatedItem));

      todoColumn.triggerEventHandler('cdkDropListDropped', mockEvent);
      fixture.detectChanges();

      expect(mockItemService.updateItem).toHaveBeenCalledWith(updatedItem);
    });

    it('should revert item status if updateItem fails', fakeAsync(() => {
      const mockEvent = {
        previousContainer: { data: mockTodoSignal() } as CdkDropList<Item[]>,
        container: { data: mockDoneSignal() } as CdkDropList<Item[]>,
        item: { data: mockItems[0] } as CdkDrag<Item>,
      } as CdkDragDrop<Item[]>;
      mockItemService.updateItem.and.returnValue(throwError(() => new Error()));

      todoColumn.triggerEventHandler('cdkDropListDropped', mockEvent);
      fixture.detectChanges();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        "Erreur lors de la suppression de l'élément",
        'Fermer',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );

      expect(mockItemsSignal.update).toHaveBeenCalledTimes(2);
      expect(
        (mockItemsSignal.update as jasmine.Spy).calls.first().args[0](mockItems)
      ).toEqual([{ ...mockItems[0], is_done: true }, mockItems[1]]);
      expect(
        (mockItemsSignal.update as jasmine.Spy).calls
          .mostRecent()
          .args[0](mockItems)
      ).toEqual(mockItems);
    }));
  });
});
