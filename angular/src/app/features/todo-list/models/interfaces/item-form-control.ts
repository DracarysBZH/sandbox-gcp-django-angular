import { FormControl } from '@angular/forms';

export interface ItemFormControl {
  title: FormControl<string>;
  description: FormControl<string>;
}
