import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ItemComponent } from './item.component';
import { ItemService } from '@features/todo-list/services/item.service';
import { Item } from '@features/todo-list/models/interfaces/item';
import { By } from '@angular/platform-browser';
import { delay, of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { signal, WritableSignal } from '@angular/core';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;

  let mockItemService: jasmine.SpyObj<ItemService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockItemsSignal: WritableSignal<Item[]> = signal<Item[]>([]);

  const mockItem: Item = {
    id: 'id',
    title: 'Test Item',
    description: 'Test Description',
    is_done: false,
    created_at: new Date('2025-07-23'),
  };

  beforeEach(async () => {
    mockItemService = jasmine.createSpyObj('ItemService', ['deleteItem'], {
      items: mockItemsSignal,
    });
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ItemComponent, DragDropModule],
      providers: [
        { provide: ItemService, useValue: mockItemService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    fixture.componentRef.setInput('item', mockItem);
    fixture.detectChanges();
  });

  it('should display item information correctly', () => {
    const titleElement = fixture.debugElement.query(By.css('mat-card-title'));
    const descriptionElement = fixture.debugElement.query(
      By.css('mat-card-content p')
    );
    const dateElement = fixture.debugElement.query(By.css('mat-card-footer'));

    expect(titleElement.nativeElement.textContent).toEqual(mockItem.title);
    expect(descriptionElement.nativeElement.textContent).toEqual(
      mockItem.description
    );
    expect(dateElement.nativeElement.textContent.trim()).toEqual(
      'Jul 23, 2025'
    );
  });

  describe('Done class', () => {
    it('should apply done-item class when item is completed', () => {
      const doneItem = { ...mockItem, is_done: true };
      fixture.componentRef.setInput('item', doneItem);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('mat-card'));
      expect(cardElement.nativeElement.classList).toContain('done-item');
    });

    it('should not apply done-item class when item is not completed', () => {
      const cardElement = fixture.debugElement.query(By.css('mat-card'));
      expect(cardElement.nativeElement.classList).not.toContain('done-item');
    });
  });

  describe('Delete', () => {
    let deleteButton: HTMLButtonElement;

    beforeEach(() => {
      deleteButton = fixture.debugElement.query(By.css('button')).nativeElement;
    });

    it('should show delete icon by default', () => {
      const deleteIcon = fixture.debugElement.query(By.css('mat-icon'));
      expect(deleteIcon.nativeElement.textContent).toBe('delete');
    });

    it('should call deleteItem when delete button is clicked', fakeAsync(() => {
      mockItemService.deleteItem.and.returnValue(
        of(undefined).pipe(delay(100))
      );
      deleteButton.click();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('mat-spinner'))).not.toBeNull();
      expect(deleteButton.disabled).toBeTrue();

      tick(100);
      fixture.detectChanges();

      expect(mockItemService.deleteItem).toHaveBeenCalledWith(mockItem.id);
    }));

    it('should delete the current item on successfull deletion', () => {
      mockItemsSignal.set([mockItem]);
      mockItemService.deleteItem.and.returnValue(of(undefined));

      deleteButton.click();
      fixture.detectChanges();

      expect(mockItemService.deleteItem).toHaveBeenCalledWith(mockItem.id);
      expect(mockItemsSignal().length).toBe(0);
    });

    it('should show error snackbar when item creation fails', () => {
      mockItemService.deleteItem.and.returnValue(throwError(() => new Error()));
      deleteButton.click();
      fixture.detectChanges();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Erreur lors de la suppression',
        'Fermer',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
    });
  });
});
