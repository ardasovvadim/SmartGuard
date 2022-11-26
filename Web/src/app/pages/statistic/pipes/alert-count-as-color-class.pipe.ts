import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'alertCountAsColorClass'
})
export class AlertCountAsColorClassPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
