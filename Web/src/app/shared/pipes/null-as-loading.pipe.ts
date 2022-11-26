import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nullAsLoading'
})
export class NullAsLoadingPipe implements PipeTransform {

  transform(value: any): string {
    return value == null ? '🔄' : value;
  }

}
