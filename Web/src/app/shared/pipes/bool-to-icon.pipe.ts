import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boolToIcon'
})
export class BoolToIconPipe implements PipeTransform {

  transform(value: boolean): string {
    switch (value) {
      case true:
        return '✅';
      case false:
        return '❌';
    }
  }

}
