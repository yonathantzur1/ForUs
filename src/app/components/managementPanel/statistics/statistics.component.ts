import { Component } from '@angular/core';

import { StatisticsService } from '../../../services/managementPanel/statistics.service';
import { ImageService } from 'src/app/services/global/image.service';
import { DateService } from '../../../services/global/date.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext.service';

import { STATISTICS_RANGE, LOG_TYPE } from '../../../enums/enums';
import { UserRegexp } from '../../../regex/regexpEnums';

declare let $: any;
declare let Chart: any;

class ChartData {
    logType: LOG_TYPE;
    statisticsRange: STATISTICS_RANGE;
    chartName: string;

    constructor(
        logType: LOG_TYPE,
        statisticsRange: STATISTICS_RANGE,
        chartName: string) {
        this.logType = logType;
        this.statisticsRange = statisticsRange;
        this.chartName = chartName;
    }
}

@Component({
    selector: 'statistics',
    templateUrl: './statistics.html',
    providers: [StatisticsService],
    styleUrls: ['./statistics.css']
})

export class StatisticsComponent {
    emailValidationFuncs: Array<InputFieldValidation>;

    menus: Array<any>;
    chart: any;
    chartTitle: string;
    selectedOptionIndex: number;
    datesRange: Object;
    datesRangeString: string;
    datesRangeMovementIndex: number = 0;
    userEmailInput: string;
    userEmail: string;
    isUserEmailFound: boolean;
    userData: any = {
        "fullName": "",
        "profileImage": ""
    };
    isLoadingChart: boolean;
    chartData: ChartData = new ChartData(
        LOG_TYPE.LOGIN,
        STATISTICS_RANGE.WEEKLY,
        "התחברויות"
    );

    constructor(public imageService: ImageService,
        private dateService: DateService,
        private statisticsService: StatisticsService,
        private microtextService: MicrotextService) {
        let self = this;

        this.emailValidationFuncs = [
            {
                isFieldValid(email: string, userRegexp: any) {
                    let emailPattern = userRegexp.email;
                    return (emailPattern.test(email));
                },
                errMsg: "כתובת אימייל לא תקינה",
                fieldId: "email-micro",
                inputId: "user-search"
            }
        ];

        this.menus = [
            {
                id: "charts",
                title: "גרפים",
                icon: "far fa-chart-bar",
                options: [
                    {
                        text: "כניסות",
                        logType: LOG_TYPE.LOGIN,
                        isSelected: true
                    },
                    {
                        text: "כניסות שגויות",
                        logType: LOG_TYPE.LOGIN_FAIL,
                    },
                    {
                        text: "בקשות שינוי סיסמא",
                        logType: LOG_TYPE.RESET_PASSWORD_REQUEST,
                    },
                    {
                        text: "משתמשים חדשים",
                        logType: LOG_TYPE.REGISTER,
                    },
                    {
                        text: "משתמשים מחוקים",
                        logType: LOG_TYPE.DELETE_USER,
                    }
                ],
                onClick: function () {
                    self.openModal(this.id);
                    self.saveCurrentSelectedOption(this.options);
                },
                onCancel: function () {
                    self.restoreSelectedOption(this.options);
                },
                onConfirm: function (options: Array<any>) {
                    self.closeModal(this.id);

                    let option;

                    for (let i = 0; i < options.length; i++) {
                        if (options[i].isSelected) {
                            option = options[i];
                            break;
                        }
                    }

                    if (option) {
                        self.chartData.logType = option.logType;
                        self.chartData.chartName = option.text;

                        self.loadChartAgain();
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
                        statisticsRange: STATISTICS_RANGE.WEEKLY,
                        isSelected: true
                    },
                    {
                        text: "שנתית",
                        statisticsRange: STATISTICS_RANGE.YEARLY,
                    }
                ],
                onClick: function () {
                    self.openModal(this.id);
                    self.saveCurrentSelectedOption(this.options);
                },
                onCancel: function () {
                    self.restoreSelectedOption(this.options);
                },
                onConfirm: function (options: Array<any>) {
                    self.closeModal(this.id);
                    let option;

                    for (let i = 0; i < options.length; i++) {
                        if (options[i].isSelected) {
                            option = options[i];
                            break;
                        }
                    }

                    if (option) {
                        self.chartData.statisticsRange = option.statisticsRange;

                        if (self.chart != null) {
                            self.loadChartAgain();
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
                isShow: function () {
                    return !!self.chart;
                },
                onClick: function () {
                    self.openModal(this.id);
                },
                onCancel: function () {
                    self.userEmailInput = null;
                    self.isUserEmailFound = null;
                    self.hideMicrotext("email-micro");
                },
                isDisableConfirm: function () {
                    return (self.userEmailInput ? false : true);
                },
                onConfirm: function () {
                    if (!this.isLoaderActive &&
                        self.userEmailInput &&
                        self.microtextService.validation(self.emailValidationFuncs,
                            self.userEmailInput,
                            UserRegexp)) {
                        this.isLoaderActive = true;
                        self.statisticsService.getUserByEmail(self.userEmailInput).then((result: any) => {
                            this.isLoaderActive = false;

                            // In case the user is not found.
                            if (result == "-1") {
                                self.isUserEmailFound = false;
                            }
                            else {
                                self.isUserEmailFound = true;

                                // Setting the user email for the chart filter.
                                self.userEmail = self.userEmailInput;

                                self.loadChartAgain();

                                self.userData["fullName"] = result.fullName;
                                self.userData["profileImage"] = result.profileImage;
                                self.userEmailInput = null;
                                self.closeModal(this.id);
                            }
                        });
                    }
                }
            }
        ];
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }

    loadChart(chartData: ChartData, datesRange?: Object) {
        this.datesRange = datesRange || this.calculateDatesRangeByRangeType(chartData.statisticsRange);
        let clientTimeZone = new Date().getTimezoneOffset();
        this.isLoadingChart = true;

        this.statisticsService.getChartData(chartData.logType,
            chartData.statisticsRange,
            this.datesRange,
            clientTimeZone,
            this.userEmail).then(data => {
                this.isLoadingChart = false;
                this.initializeChart(chartData.chartName,
                    chartData.statisticsRange,
                    this.datesRange, data);
            });
    }

    initializeChart(name: string, range: STATISTICS_RANGE, datesRange: Object, data: Array<number>) {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chartTitle = name;
        this.datesRangeString = getDateString(datesRange["endDate"]) + " - " + getDateString(datesRange["startDate"]);

        let labels;

        switch (range) {
            case STATISTICS_RANGE.YEARLY: {
                labels = this.dateService.months;
                break;
            }
            case STATISTICS_RANGE.WEEKLY: {
                labels = this.dateService.days;
                break;
            }
            default: {
                console.error("The range " + range + "is not valid");
            }
        }

        let ctx = "statistics-chart";
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
                        'rgba(13, 255, 51, 0.2)',
                        'rgba(25, 25, 193, 0.2)',
                        'rgba(255, 222, 3, 0.2)',
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
                        'rgba(255, 222, 3, 1)',
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
                    onClick: (event: any) => event.stopPropagation()
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
    }

    selectOption(options: Array<any>, index: number) {
        options.forEach(option => {
            option.isSelected = false;
        });

        options[index].isSelected = true;
    }

    openModal(modalId: string) {
        $("#" + modalId).modal("show");
    }

    closeModal(modalId: string) {
        $("#" + modalId).modal("hide");
    }

    saveCurrentSelectedOption(options: Array<any>) {
        options.forEach((option, index) => {
            if (option.isSelected) {
                this.selectedOptionIndex = index;
            }
        });
    }

    restoreSelectedOption(options: Array<any>) {
        options.forEach((option, index) => {
            option.isSelected = (index == this.selectedOptionIndex);
        });
    }

    calculateDatesRangeByRangeType(range: STATISTICS_RANGE): Object {
        // Reset date ranges page for the calculate of the current date by range.
        this.datesRangeMovementIndex = 0;

        let currDate = new Date();
        let result: any = {
            "startDate": null,
            "endDate": null
        }

        switch (range) {
            case STATISTICS_RANGE.YEARLY: {
                let currentYear = currDate.getFullYear();
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

    getNextDatesRangePeriod() {
        if (this.datesRangeMovementIndex != 0) {
            this.datesRangeMovementIndex++;
            let startDate: Date = this.datesRange["startDate"];
            let endDate: Date = this.datesRange["endDate"];

            switch (this.chartData.statisticsRange) {
                case STATISTICS_RANGE.WEEKLY: {
                    startDate.setDate(startDate.getDate() + 7);
                    endDate.setDate(endDate.getDate() + 7);

                    break;
                }
                case STATISTICS_RANGE.YEARLY: {
                    startDate.setFullYear(startDate.getFullYear() + 1);
                    endDate.setFullYear(endDate.getFullYear() + 1);

                    break;
                }
            }

            this.loadChart(this.chartData, this.datesRange);
        }
    }

    getPreviousDatesRangePeriod() {
        this.datesRangeMovementIndex--;
        let startDate = this.datesRange["startDate"];
        let endDate = this.datesRange["endDate"];

        switch (this.chartData.statisticsRange) {
            case STATISTICS_RANGE.WEEKLY: {
                startDate.setDate(startDate.getDate() - 7);
                endDate.setDate(endDate.getDate() - 7);

                break;
            }
            case STATISTICS_RANGE.YEARLY: {
                startDate.setFullYear(startDate.getFullYear() - 1);
                endDate.setFullYear(endDate.getFullYear() - 1);

                break;
            }
        }

        this.loadChartAgain(this.datesRange);
    }

    clearUserChart() {
        // Reset user data.
        Object.keys(this.userData).forEach(key => {
            this.userData[key] = null;
        });

        this.userEmail = null;

        this.loadChartAgain();
    }

    // Full loading the chart objects and data.
    // May send data range object to control the dates of chart.
    loadChartAgain(datesRange?: Object) {
        this.loadChart(this.chartData, datesRange);
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
    date.setHours(23, 59, 59, 99);

    return date;
}

function getDateString(date: Date) {
    let day: any = date.getDate();
    let month: any = date.getMonth() + 1;
    let year: any = date.getFullYear();

    if (day < 10) {
        day = "0" + day;
    }

    if (month < 10) {
        month = "0" + month;
    }

    return (day + "/" + month + "/" + year);
}