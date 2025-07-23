import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  WritableSignal,
} from '@angular/core';
import { ItemService } from '@features/todo-list/services/item.service';
import { Item } from '@features/todo-list/models/interfaces/item';
import { MatListModule } from '@angular/material/list';
import { ItemComponent } from '@features/todo-list/components/item/item.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CreateItemComponent } from '@features/todo-list/components/create-item/create-item.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Subject, take, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-todo-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    ItemComponent,
    MatProgressSpinnerModule,
    MatDialogModule,
    ScrollingModule,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements OnInit, OnDestroy {
  private readonly itemService: ItemService = inject(ItemService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly destroyed$ = new Subject<void>();

  loading = true;
  items: WritableSignal<Item[]> = this.itemService.items;
  toDoItems: Signal<Item[]> = this.itemService.toDoItems;
  doneItems: Signal<Item[]> = this.itemService.doneItems;

  trackByItemId = (_: number, item: Item): string => item.id;

  ngOnInit(): void {
    this.loadItems();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  toggleAddItem(): void {
    this.dialog.open(CreateItemComponent, {
      minWidth: '38rem',
    });
  }

  changeItemStatus(event: CdkDragDrop<Item[]>): void {
    if (event.previousContainer !== event.container) {
      const dragItem: Item = event.item.data;
      const itemToUpdate: Item = { ...dragItem, is_done: !dragItem.is_done };

      this.items.update((currentItems: Item[]) =>
        currentItems.map((item: Item) =>
          item.id == dragItem.id ? itemToUpdate : item
        )
      );

      this.itemService.updateItem(itemToUpdate).subscribe({
        next: (updatedItem: Item): void => {
          this.items.update((currentItems: Item[]) =>
            currentItems.map((item: Item) =>
              item.id == updatedItem.id ? updatedItem : item
            )
          );
        },
        error: (): void => {
          this.items.update((currentItems: Item[]) =>
            currentItems.map((item: Item) =>
              item.id == dragItem.id ? dragItem : item
            )
          );
          this.snackBar.open(
            "Erreur lors de la suppression de l'élément",
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

  private loadItems() {
    this.itemService
      .getAllItems()
      .pipe(takeUntil(this.destroyed$), take(1))
      .subscribe({
        next: (data: Item[]): void => {
          this.items.set(data);
          this.loading = false;
        },
        error: (): void => {
          this.items.set([]);
          this.loading = false;
        },
      });
  }
}
