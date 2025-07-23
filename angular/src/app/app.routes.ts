import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'todo',
    pathMatch: 'full',
  },
  {
    path: 'todo',
    loadComponent: () =>
      import(
        '@features/todo-list/components/todo-list/todo-list.component'
      ).then(m => m.TodoListComponent),
  },
  {
    path: '**',
    redirectTo: 'todo',
  },
];
