import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sortObjects' })
export class SortObjects implements PipeTransform {
    transform(arr: any, property: any) {
        return arr.sort((a: any, b: any) => {
            var aValue = a[property];
            var bValue = b[property];

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