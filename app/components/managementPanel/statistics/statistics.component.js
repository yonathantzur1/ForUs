"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var enums_1 = require("../../../enums/enums");
var statistics_service_1 = require("../../../services/managementPanel/statistics/statistics.service");
var StatisticsComponent = /** @class */ (function () {
    function StatisticsComponent(statisticsService) {
        this.statisticsService = statisticsService;
        this.chartsValues = {
            logType: null,
            statisticsRange: enums_1.STATISTICS_RANGE.WEEKLY,
            chartName: ""
        };
        this.menus = [
            {
                id: "charts-modal",
                title: "גרפים",
                icon: "far fa-chart-bar",
                options: [
                    {
                        text: "התחברויות",
                        logType: enums_1.LOG_TYPE.LOGIN,
                        isSelected: true
                    },
                    {
                        text: "התחברויות שגויות",
                        logType: enums_1.LOG_TYPE.LOGIN_FAIL,
                        isSelected: false
                    },
                    {
                        text: "בקשות שינוי סיסמא",
                        logType: enums_1.LOG_TYPE.RESET_PASSWORD_REQUEST,
                        isSelected: false
                    }
                ],
                onConfirm: function (self, options) {
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
                            self.LoadChart(self.chartsValues.logType, self.chartsValues.statisticsRange, self.chartsValues.chartName);
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
                        statisticsRange: enums_1.STATISTICS_RANGE.WEEKLY,
                        isSelected: true
                    },
                    {
                        text: "שנתית",
                        statisticsRange: enums_1.STATISTICS_RANGE.YEARLY,
                        isSelected: false
                    }
                ],
                onConfirm: function (self, options) {
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
                                self.LoadChart(self.chartsValues.logType, self.chartsValues.statisticsRange, self.chartsValues.chartName);
                            }
                        }
                    }
                }
            }
        ];
    }
    StatisticsComponent.prototype.ngOnInit = function () {
    };
    StatisticsComponent.prototype.LoadChart = function (type, range, chartName) {
        var _this = this;
        this.statisticsService.GetChartData(type, range, this.CalculateDatesRangeByRange(range)).then(function (data) {
            _this.InitializeChart(chartName, range, data);
        });
    };
    StatisticsComponent.prototype.InitializeChart = function (name, range, data) {
        if (this.chart) {
            this.chart.destroy();
        }
        var labels;
        switch (range) {
            case enums_1.STATISTICS_RANGE.YEARLY: {
                labels = globalVariables.months;
                break;
            }
            case enums_1.STATISTICS_RANGE.WEEKLY: {
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
                labels: labels,
                datasets: [{
                        label: name,
                        data: data,
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
    };
    StatisticsComponent.prototype.OpenChartsMenu = function () {
        $("#charts-modal").modal('show');
    };
    StatisticsComponent.prototype.OpenChartsTimeMenu = function () {
        $("#charts-time-modal").modal('show');
    };
    StatisticsComponent.prototype.SelectOption = function (options, index) {
        options.forEach(function (option) {
            option.isSelected = false;
        });
        options[index].isSelected = true;
    };
    StatisticsComponent.prototype.CloseModalOnConfirm = function (modalId) {
        $("#" + modalId).modal("hide");
    };
    StatisticsComponent.prototype.CalculateDatesRangeByRange = function (range) {
        var currDate = new Date();
        var result = {
            "startDate": null,
            "endDate": null
        };
        switch (range) {
            case enums_1.STATISTICS_RANGE.YEARLY: {
                var currentYear = currDate.getFullYear();
                result["startDate"] = new Date(currentYear, 0, 1);
                result["endDate"] = new Date(currentYear, 11, 31);
                return result;
            }
            case enums_1.STATISTICS_RANGE.WEEKLY: {
                result["startDate"] = getStartOfWeek(currDate);
                result["endDate"] = getEndOfWeek(currDate);
                return result;
            }
            default: {
                return null;
            }
        }
    };
    StatisticsComponent = __decorate([
        core_1.Component({
            selector: 'statistics',
            templateUrl: './statistics.html',
            providers: [statistics_service_1.StatisticsService]
        }),
        __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
    ], StatisticsComponent);
    return StatisticsComponent;
}());
exports.StatisticsComponent = StatisticsComponent;
function getStartOfWeek(date) {
    // Copy date if provided, or use current date if not
    date = date ? new Date(+date) : new Date();
    date.setHours(0, 0, 0, 0);
    // Set date to previous Sunday
    date.setDate(date.getDate() - date.getDay());
    return date;
}
function getEndOfWeek(date) {
    date = getStartOfWeek(date);
    date.setDate(date.getDate() + 6);
    return date;
}
//# sourceMappingURL=statistics.component.js.map