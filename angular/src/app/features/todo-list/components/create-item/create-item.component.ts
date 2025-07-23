import { Component, inject, WritableSignal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ItemFormControl } from '../../models/interfaces/item-form-control';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ItemService } from '@features/todo-list/services/item.service';
import { Item } from '@features/todo-list/models/interfaces/item';
import { CreateItem } from '@features/todo-list/models/interfaces/create-item';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-item',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './create-item.component.html',
  styleUrl: './create-item.component.scss',
})
export class CreateItemComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateItemComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly itemService: ItemService = inject(ItemService);

  items: WritableSignal<Item[]> = this.itemService.items;

  itemFormGroup: FormGroup<ItemFormControl> = this.fb.group({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  isCreatingItem = false;

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.itemFormGroup.valid) {
      this.isCreatingItem = true;
      const item: CreateItem = {
        title: this.itemFormGroup.controls.title.value,
        description: this.itemFormGroup.controls.description.value,
      };
      this.itemService.createItem(item).subscribe({
        next: (newItem: Item): void => {
          this.isCreatingItem = false;
          this.items.update((currentItems: Item[]) => [
            ...currentItems,
            newItem,
          ]);
          this.dialogRef.close();
        },
        error: () => {
          this.isCreatingItem = false;
          this.snackBar.open(
            "Erreur lors de la création de l'élément",
            'Fermer',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
    }
  }
}
