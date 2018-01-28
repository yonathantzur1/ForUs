import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sortObjects' })
export class SortObjects implements PipeTransform {
    transform(arr: any, property: any) {
        return arr.sort((a: any, b: any) => {
            var aValue = property ? a[property] : a;
            var bValue = property ? b[property] : b;

            if (aValue < bValue) {
                return -1;
            }
            else if (aValue > bValue) {
                return 1;
            }
            else {
                return 0;
            }
        });;
    }
}