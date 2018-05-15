import { Component } from '@angular/core';

import { StatisticsService } from '../../../services/managementPanel/statistics/statistics.service';

@Component({
    selector: 'statistics',
    templateUrl: './statistics.html',
    providers: [StatisticsService]
})

export class StatisticsComponent {

    constructor(private statisticsService: StatisticsService) { }
}