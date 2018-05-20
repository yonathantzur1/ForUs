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
    menus: Array<any>;
    chart: any;
    chartsValues: Object = {
        logType: null,
        statisticsRange: STATISTICS_RANGE.WEEKLY,
        chartName: ""
    };

    constructor(private statisticsService: StatisticsService) {
        this.menus = [
            {
                id: "charts-modal",
                title: "גרפים",
                icon: "far fa-chart-bar",
                options: [
                    {
                        text: "התחברויות",
                        logType: LOG_TYPE.LOGIN,
                        isSelected: true
                    },
                    {
                        text: "התחברויות שגויות",
                        logType: LOG_TYPE.LOGIN_FAIL,
                        isSelected: false
                    },
                    {
                        text: "בקשות שינוי סיסמא",
                        logType: LOG_TYPE.RESET_PASSWORD_REQUEST,
                        isSelected: false
                    }
                ],
                onConfirm: function (self: any, options: Array<any>) {
                    var option;

                    for (var i = 0; i < options.length; i++) {
                        if (options[i].isSelected) {
                            option = options[i];
                            break;
                        }
                    }

                    if (option) {
                        if (self.chartsValues.logType != option.logType) {
                            self.chartsValues.logType = option.logType;
                            self.chartsValues.chartName = option.text;

                            self.LoadChart(self.chartsValues.logType,
                                self.chartsValues.statisticsRange,
                                self.chartsValues.chartName);
                        }
                    }
                }
            },
            {
                id: "charts-time-modal",
                title: "תצוגת זמן",
                icon: "far fa-clock",
                options: [
                    {
                        text: "שבועית",
                        statisticsRange: STATISTICS_RANGE.WEEKLY,
                        isSelected: true
                    },
                    {
                        text: "שנתית",
                        statisticsRange: STATISTICS_RANGE.YEARLY,
                        isSelected: false
                    }
                ],
                onConfirm: function (self: any, options: Array<any>) {
                    var option;

                    for (var i = 0; i < options.length; i++) {
                        if (options[i].isSelected) {
                            option = options[i];
                            break;
                        }
                    }

                    if (option) {
                        if (self.chartsValues.statisticsRange != option.statisticsRange) {
                            self.chartsValues.statisticsRange = option.statisticsRange;

                            if (self.chart != null) {
                                self.LoadChart(self.chartsValues.logType,
                                    self.chartsValues.statisticsRange,
                                    self.chartsValues.chartName);
                            }
                        }
                    }
                }
            }
        ];
    }

    ngOnInit() {

    }

    LoadChart(type: LOG_TYPE, range: STATISTICS_RANGE, chartName: string) {
        this.statisticsService.GetChartData(type, range, this.CalculateDatesRangeByRange(range)).then(data => {
            this.InitializeChart(chartName, range, data);
        });
    }

    InitializeChart(name: string, range: STATISTICS_RANGE, data: Array<number>) {
        if (this.chart) {
            this.chart.destroy();
        }

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
        this.chart = new Chart(ctx, {
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

    OpenChartsMenu() {
        $("#charts-modal").modal('show');
    }

    OpenChartsTimeMenu() {
        $("#charts-time-modal").modal('show');
    }

    SelectOption(options: Array<any>, index: number) {
        options.forEach(option => {
            option.isSelected = false;
        });

        options[index].isSelected = true;
    }

    CloseModalOnConfirm(modalId: string) {
        $("#" + modalId).modal("hide");
    }

    CalculateDatesRangeByRange(range: STATISTICS_RANGE): Object {
        var currDate = new Date();
        var result: any = {
            "startDate": null,
            "endDate": null
        }

        switch (range) {
            case STATISTICS_RANGE.YEARLY: {
                var currentYear = currDate.getFullYear();
                result["startDate"] = new Date(currentYear, 0, 1);
                result["endDate"] = new Date(currentYear, 11, 31);
                return result;
            }
            case STATISTICS_RANGE.WEEKLY: {
                result["startDate"] = getStartOfWeek(currDate);
                result["endDate"] = getEndOfWeek(currDate);
                return result
            }
            default: {
                return null;
            }
        }
    }
}

function getStartOfWeek(date: Date) {

    // Copy date if provided, or use current date if not
    date = date ? new Date(+date) : new Date();
    date.setHours(0, 0, 0, 0);

    // Set date to previous Sunday
    date.setDate(date.getDate() - date.getDay());

    return date;
}

function getEndOfWeek(date: Date) {
    date = getStartOfWeek(date);
    date.setDate(date.getDate() + 6);
    return date;
}