import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { CreateItemComponent } from './create-item.component';
import { ItemService } from '@features/todo-list/services/item.service';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Item } from '@features/todo-list/models/interfaces/item';
import { delay, of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal, WritableSignal } from '@angular/core';

describe('CreateItemComponent', () => {
  let component: CreateItemComponent;
  let fixture: ComponentFixture<CreateItemComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CreateItemComponent>>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockItemService: jasmine.SpyObj<ItemService>;

  const mockItemsSignal: WritableSignal<Item[]> = signal<Item[]>([]);

  const mockCreatedItem: Item = {
    id: 'id',
    title: 'Test Item',
    description: 'Test Description',
    is_done: false,
    created_at: new Date(),
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockItemService = jasmine.createSpyObj('ItemService', ['createItem'], {
      items: mockItemsSignal,
    });
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [CreateItemComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ItemService, useValue: mockItemService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Title and form label', () => {
    it('should display the dialog title', () => {
      const titleElement = fixture.debugElement.query(
        By.css('h2[mat-dialog-title]')
      );
      expect(titleElement.nativeElement.textContent).toEqual(
        'Ajouter un nouvel item'
      );
    });

    it('should display form field with correct labels', () => {
      const matLabels = fixture.debugElement.queryAll(By.css('mat-label'));
      expect(matLabels.length).toBe(2);
      expect(matLabels[0].nativeElement.textContent).toEqual('Titre');
      expect(matLabels[1].nativeElement.textContent).toEqual('Description');
    });

    it('should display action buttons', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBe(2);
      expect(buttons[0].nativeElement.textContent.trim()).toEqual('Annuler');
      expect(buttons[1].nativeElement.textContent.trim()).toEqual('Ajouter');
    });

    it('should not display the loading spinner on submit button by default', () => {
      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]')
      );
      const matIcon = submitButton.query(By.css('mat-icon'));
      expect(matIcon).toBeNull();
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      component.itemFormGroup.reset();
      component.itemFormGroup.markAsUntouched();
      fixture.detectChanges();
    });

    it('should show required error for title when touched and empty', async () => {
      const titleInput = fixture.debugElement.query(
        By.css('input[formControlName="title"]')
      );

      titleInput.nativeElement.focus();
      titleInput.nativeElement.blur();
      titleInput.nativeElement.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('mat-error'));
      expect(errorElement.nativeElement.textContent).toBe(
        'Le titre est requis'
      );
    });

    it('should show required error for description when touched and empty', async () => {
      const descriptionInput = fixture.debugElement.query(
        By.css('textarea[formControlName="description"]')
      );

      descriptionInput.nativeElement.focus();
      descriptionInput.nativeElement.blur();
      descriptionInput.nativeElement.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('mat-error'));
      expect(errorElement.nativeElement.textContent).toEqual(
        'La description est requise'
      );
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.debugElement.queryAll(By.css('button'))[1];
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should enable submit button when form is valid', async () => {
      const titleInput = fixture.debugElement.query(
        By.css('input[formControlName="title"]')
      );
      const descriptionInput = fixture.debugElement.query(
        By.css('textarea[formControlName="description"]')
      );

      titleInput.nativeElement.value = 'Test Title';
      titleInput.nativeElement.dispatchEvent(new Event('input'));

      descriptionInput.nativeElement.value = 'Test Description';
      descriptionInput.nativeElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const submitButton = fixture.debugElement.queryAll(By.css('button'))[1];
      expect(submitButton.nativeElement.disabled).toBeFalse();
    });
  });

  describe('Action buttons', () => {
    it('should call close dialog function when cancel button is clicked', () => {
      const cancelButton = fixture.debugElement.queryAll(By.css('button'))[0];
      cancelButton.nativeElement.click();
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    });

    it('should not call create item function when form is invalid', () => {
      const submitButton = fixture.debugElement.queryAll(By.css('button'))[1];
      submitButton.nativeElement.click();
      expect(mockItemService.createItem).not.toHaveBeenCalled();
    });

    describe('Submit action', () => {
      const title = 'Title';
      const description = 'Description';
      let submitButton: HTMLButtonElement;

      beforeEach(() => {
        submitButton = fixture.debugElement.queryAll(By.css('button'))[1]
          .nativeElement;

        const titleInput = fixture.debugElement.query(
          By.css('input[formControlName="title"]')
        );
        const descriptionInput = fixture.debugElement.query(
          By.css('textarea[formControlName="description"]')
        );

        titleInput.nativeElement.value = title;
        titleInput.nativeElement.dispatchEvent(new Event('input'));
        descriptionInput.nativeElement.value = description;
        descriptionInput.nativeElement.dispatchEvent(new Event('input'));

        fixture.detectChanges();
      });

      it('should create the item, display the spinner and disabled the submit button when button is clicked with valid form', fakeAsync(() => {
        mockItemService.createItem.and.returnValue(
          of(mockCreatedItem).pipe(delay(100))
        );
        submitButton.click();
        fixture.detectChanges();

        expect(
          fixture.debugElement.query(By.css('mat-spinner'))
        ).not.toBeNull();
        expect(submitButton.disabled).toBeTrue();

        tick(100);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('mat-spinner'))).toBeNull();
        expect(mockItemService.createItem).toHaveBeenCalledWith({
          title,
          description,
        });
        expect(mockItemsSignal().length).toBe(1);
        expect(mockItemsSignal()).toEqual([mockCreatedItem]);
      }));

      it('should show error snackbar when item creation fails', () => {
        mockItemService.createItem.and.returnValue(
          throwError(() => new Error())
        );
        submitButton.click();
        fixture.detectChanges();

        expect(mockSnackBar.open).toHaveBeenCalledWith(
          "Erreur lors de la création de l'élément",
          'Fermer',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
      });
    });
  });
});
