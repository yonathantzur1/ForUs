import { Component, OnInit } from '@angular/core';

import { STATISTICS_RANGE, LOG_TYPE } from '../../../enums/enums';

import { StatisticsService } from '../../../services/managementPanel/statistics/statistics.service';

declare var $: any;
declare var document: any;
declare var Chart: any;
declare var globalVariables: any;

@Component({
    selector: 'statistics',
    templateUrl: './statistics.html',
    providers: [StatisticsService]
})

export class StatisticsComponent implements OnInit {

    constructor(private statisticsService: StatisticsService) { }

    ngOnInit() {
        this.statisticsService.GetLoginsData(LOG_TYPE.LOGIN, STATISTICS_RANGE.YEARLY).then(data => {
            this.InitializeChart("התחברויות" , STATISTICS_RANGE.YEARLY, data);
        });
    }

    InitializeChart(name: string, range: STATISTICS_RANGE, data: Array<number>) {
        var labels;

        switch (range) {
            case STATISTICS_RANGE.YEARLY: {
                labels = globalVariables.months;
                break;
            }
            case STATISTICS_RANGE.WEEKLY: {
                labels = globalVariables.days;
                break;
            }
            default: {
                console.error("The range " + range + "is not valid");
            }
        }

        var ctx = "statistics-chart";
        var chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: name,
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(64, 255, 94, 0.2)',
                        'rgba(25, 25, 193, 0.2)',
                        'rgba(250, 251, 22, 0.2)',
                        'rgba(49, 232, 230, 0.2)',
                        'rgba(230, 28, 67, 0.2)',
                        'rgba(191, 165, 162, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(64, 255, 94, 1)',
                        'rgba(25, 25, 193, 1)',
                        'rgba(250, 251, 22, 1)',
                        'rgba(49, 232, 230, 1)',
                        'rgba(230, 28, 67, 1)',
                        'rgba(191, 165, 162, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
}