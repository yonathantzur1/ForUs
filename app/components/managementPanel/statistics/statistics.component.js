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
var global_service_1 = require("../../../services/global/global.service");
var StatisticsComponent = /** @class */ (function () {
    function StatisticsComponent(globalService, statisticsService) {
        this.globalService = globalService;
        this.statisticsService = statisticsService;
        this.datesRangeMovementIndex = 0;
        this.userData = {
            "fullName": null,
            "profileImage": null
        };
        this.chartsValues = {
            logType: enums_1.LOG_TYPE.LOGIN,
            statisticsRange: enums_1.STATISTICS_RANGE.WEEKLY,
            chartName: "התחברויות"
        };
        this.menus = [
            {
                id: "charts",
                title: "גרפים",
                icon: "far fa-chart-bar",
                options: [
                    {
                        text: "כניסות",
                        logType: enums_1.LOG_TYPE.LOGIN,
                        isSelected: true
                    },
                    {
                        text: "כניסות שגויות",
                        logType: enums_1.LOG_TYPE.LOGIN_FAIL,
                        isSelected: false
                    },
                    {
                        text: "ניסיונות כניסת משתמש חסום",
                        logType: enums_1.LOG_TYPE.BLOCK_USER_LOGIN_TRY,
                        isSelected: false
                    },
                    {
                        text: "בקשות שינוי סיסמא",
                        logType: enums_1.LOG_TYPE.RESET_PASSWORD_REQUEST,
                        isSelected: false
                    },
                    {
                        text: "משתמשים חדשים",
                        logType: enums_1.LOG_TYPE.REGISTER,
                        isSelected: false
                    }
                ],
                onClick: function (self) {
                    self.OpenModal(this.id);
                    self.SaveCurrentSelectedOption(this.options);
                },
                onCancel: function (self) {
                    self.RestoreSelectedOption(this.options);
                },
                onConfirm: function (self, options) {
                    self.CloseModal(this.id);
                    var option;
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].isSelected) {
                            option = options[i];
                            break;
                        }
                    }
                    if (option) {
                        self.chartsValues.logType = option.logType;
                        self.chartsValues.chartName = option.text;
                        self.LoadChartAgain();
                    }
                }
            },
            {
                id: "charts-time",
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
                onClick: function (self) {
                    self.OpenModal(this.id);
                    self.SaveCurrentSelectedOption(this.options);
                },
                onCancel: function (self) {
                    self.RestoreSelectedOption(this.options);
                },
                onConfirm: function (self, options) {
                    self.CloseModal(this.id);
                    var option;
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].isSelected) {
                            option = options[i];
                            break;
                        }
                    }
                    if (option) {
                        self.chartsValues.statisticsRange = option.statisticsRange;
                        if (self.chart != null) {
                            self.LoadChartAgain();
                        }
                    }
                }
            },
            {
                id: "charts-user-search",
                title: "חיפוש משתמש",
                icon: "fas fa-search",
                type: "user-search",
                isLoaderActive: false,
                isShow: function (self) {
                    return (self.chart ? true : false);
                },
                onClick: function (self) {
                    self.OpenModal(this.id);
                },
                onCancel: function (self) {
                    self.userEmailInput = null;
                    self.isUserEmailFound = null;
                },
                isDisableConfirm: function (self) {
                    return (self.userEmailInput ? false : true);
                },
                onConfirm: function (self) {
                    var _this = this;
                    if (!this.isLoaderActive && self.userEmailInput) {
                        this.isLoaderActive = true;
                        self.statisticsService.GetUserByEmail(self.userEmailInput).then(function (result) {
                            _this.isLoaderActive = false;
                            // In case the user is not found.
                            if (result == "-1") {
                                self.isUserEmailFound = false;
                            }
                            else {
                                self.isUserEmailFound = true;
                                // Setting the user email for the chart filter.
                                self.userEmail = self.userEmailInput;
                                self.LoadChartAgain();
                                self.userData["fullName"] = result.fullName;
                                self.userData["profileImage"] = result.profileImage;
                                self.userEmailInput = null;
                                self.CloseModal(_this.id);
                            }
                        });
                    }
                }
            }
        ];
    }
    StatisticsComponent.prototype.LoadChart = function (type, range, chartName, datesRange) {
        var _this = this;
        this.datesRange = datesRange || this.CalculateDatesRangeByRangeType(range);
        this.isLoadingChart = true;
        this.statisticsService.GetChartData(type, range, this.datesRange, this.userEmail).then(function (data) {
            _this.isLoadingChart = false;
            _this.InitializeChart(chartName, range, _this.datesRange, data);
        });
    };
    StatisticsComponent.prototype.InitializeChart = function (name, range, datesRange, data) {
        if (this.chart) {
            this.chart.destroy();
        }
        this.chartTitle = name;
        this.datesRangeString = getDateString(datesRange["endDate"]) + " - " + getDateString(datesRange["startDate"]);
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
                            'rgba(13, 255, 51, 0.2)',
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
                            'rgba(13, 255, 51, 1)',
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
                legend: {
                    display: false,
                    labels: {
                        fontFamily: 'Rubik',
                        fontColor: '#4b4b4b',
                        fontSize: 18,
                        boxWidth: 0
                    },
                    onClick: function (event) { return event.stopPropagation(); }
                },
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
    StatisticsComponent.prototype.SelectOption = function (options, index) {
        options.forEach(function (option) {
            option.isSelected = false;
        });
        options[index].isSelected = true;
    };
    StatisticsComponent.prototype.OpenModal = function (modalId) {
        $("#" + modalId).modal("show");
    };
    StatisticsComponent.prototype.CloseModal = function (modalId) {
        $("#" + modalId).modal("hide");
    };
    StatisticsComponent.prototype.SaveCurrentSelectedOption = function (options) {
        var _this = this;
        options.forEach(function (option, index) {
            if (option.isSelected) {
                _this.selectedOptionIndex = index;
            }
        });
    };
    StatisticsComponent.prototype.RestoreSelectedOption = function (options) {
        var _this = this;
        options.forEach(function (option, index) {
            option.isSelected = (index == _this.selectedOptionIndex);
        });
    };
    StatisticsComponent.prototype.CalculateDatesRangeByRangeType = function (range) {
        // Reset date ranges page for the calculate of the current date by range.
        this.datesRangeMovementIndex = 0;
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
    StatisticsComponent.prototype.GetNextDatesRangePeriod = function () {
        if (this.datesRangeMovementIndex != 0) {
            this.datesRangeMovementIndex++;
            var startDate = this.datesRange["startDate"];
            var endDate = this.datesRange["endDate"];
            switch (this.chartsValues["statisticsRange"]) {
                case enums_1.STATISTICS_RANGE.WEEKLY: {
                    startDate.setDate(startDate.getDate() + 7);
                    endDate.setDate(endDate.getDate() + 7);
                    break;
                }
                case enums_1.STATISTICS_RANGE.YEARLY: {
                    startDate.setFullYear(startDate.getFullYear() + 1);
                    endDate.setFullYear(endDate.getFullYear() + 1);
                    break;
                }
            }
            this.LoadChart(this.chartsValues["logType"], this.chartsValues["statisticsRange"], this.chartsValues["chartName"], this.datesRange);
        }
    };
    StatisticsComponent.prototype.GetPreviousDatesRangePeriod = function () {
        this.datesRangeMovementIndex--;
        var startDate = this.datesRange["startDate"];
        var endDate = this.datesRange["endDate"];
        switch (this.chartsValues["statisticsRange"]) {
            case enums_1.STATISTICS_RANGE.WEEKLY: {
                startDate.setDate(startDate.getDate() - 7);
                endDate.setDate(endDate.getDate() - 7);
                break;
            }
            case enums_1.STATISTICS_RANGE.YEARLY: {
                startDate.setFullYear(startDate.getFullYear() - 1);
                endDate.setFullYear(endDate.getFullYear() - 1);
                break;
            }
        }
        this.LoadChartAgain(this.datesRange);
    };
    StatisticsComponent.prototype.ClearUserChart = function () {
        var _this = this;
        // Reset user data.
        Object.keys(this.userData).forEach(function (key) {
            _this.userData[key] = null;
        });
        this.userEmail = null;
        this.LoadChartAgain();
    };
    // Full loading the chart objects and data.
    // May send data range object to control the dates of chart.
    StatisticsComponent.prototype.LoadChartAgain = function (datesRange) {
        this.LoadChart(this.chartsValues["logType"], this.chartsValues["statisticsRange"], this.chartsValues["chartName"], datesRange);
    };
    StatisticsComponent = __decorate([
        core_1.Component({
            selector: 'statistics',
            templateUrl: './statistics.html',
            providers: [statistics_service_1.StatisticsService]
        }),
        __metadata("design:paramtypes", [global_service_1.GlobalService,
            statistics_service_1.StatisticsService])
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
    date.setHours(23, 59, 59, 99);
    return date;
}
function getDateString(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    return (day + "/" + month + "/" + year);
}
//# sourceMappingURL=statistics.component.js.map