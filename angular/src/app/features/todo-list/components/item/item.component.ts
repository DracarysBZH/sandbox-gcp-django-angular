import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  WritableSignal,
} from '@angular/core';
import { Item } from '../../models/interfaces/item';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ItemService } from '@features/todo-list/services/item.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-item',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CdkDragPlaceholder,
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent {
  @Input() item!: Item;

  isDeleting = false;
  private readonly itemService = inject(ItemService);
  private readonly snackBar = inject(MatSnackBar);

  items: WritableSignal<Item[]> = this.itemService.items;

  deleteItem(): void {
    this.isDeleting = true;
    this.itemService.deleteItem(this.item.id).subscribe({
      next: (): void => {
        this.items.update((currentItems: Item[]) =>
          currentItems.filter((item: Item) => item != this.item)
        );
      },
      error: (): void => {
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
