import { Component, OnInit } from '@angular/core';

import { STATISTICS_RANGE } from '../../../enums/enums';

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

    barsColors: Array<string> = [
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
    ]

    constructor(private statisticsService: StatisticsService) { }

    ngOnInit() {
        this.InitializeChart("התחברויות", STATISTICS_RANGE.MONTHLY, [2, 5, 8, 7, 6, 5, 2, 5, 8, 7, 6, 5]);

        // this.statisticsService.GetLoginsData(STATISTICS_RANGE.MONTHLY).then(reuslt => {
        //     var x = reuslt;
        // });
    }

    InitializeChart(name: string, range: STATISTICS_RANGE, data: Array<number>) {
        var labels;

        switch (range) {
            case STATISTICS_RANGE.MONTHLY: {
                labels = globalVariables.months;
                break;
            }
            case STATISTICS_RANGE.WEEKLY: {
                labels = ["שבוע 1", "2", "שבוע 3", "שבוע 4"];
                break;
            }
            case STATISTICS_RANGE.DAILY: {
                labels = globalVariables.days;
                break;
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
                    backgroundColor: this.barsColors,
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
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