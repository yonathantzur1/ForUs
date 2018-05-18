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
        this.barsColors = [
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
        ];
    }
    StatisticsComponent.prototype.ngOnInit = function () {
        this.InitializeChart("התחברויות", enums_1.STATISTICS_RANGE.MONTHLY, [2, 5, 8, 7, 6, 5, 2, 5, 8, 7, 6, 5]);
        // this.statisticsService.GetLoginsData(STATISTICS_RANGE.MONTHLY).then(reuslt => {
        //     var x = reuslt;
        // });
    };
    StatisticsComponent.prototype.InitializeChart = function (name, range, data) {
        var labels;
        switch (range) {
            case enums_1.STATISTICS_RANGE.MONTHLY: {
                labels = globalVariables.months;
                break;
            }
            case enums_1.STATISTICS_RANGE.WEEKLY: {
                labels = ["שבוע 1", "2", "שבוע 3", "שבוע 4"];
                break;
            }
            case enums_1.STATISTICS_RANGE.DAILY: {
                labels = globalVariables.days;
                break;
            }
        }
        var ctx = "statistics-chart";
        var chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                        label: name,
                        data: data,
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
//# sourceMappingURL=statistics.component.js.map