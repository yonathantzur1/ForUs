import { Component } from '@angular/core';

import { StatisticsService } from '../../../services/managementPanel/statistics.service';
import { ImageService } from 'src/app/services/global/image.service';
import { DateService } from '../../../services/global/date.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext.service';

import { STATISTICS_RANGE, LOG_TYPE } from '../../../enums/enums';
import { UserRegexp } from '../../../regex/regexpEnums';

declare let $: any;
declare let Chart: any;

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
    userData: Object = {
        "fullName": null,
        "profileImage": null
    };
    isLoadingChart: boolean;
    chartsValues: Object = {
        logType: LOG_TYPE.LOGIN,
        statisticsRange: STATISTICS_RANGE.WEEKLY,
        chartName: "התחברויות"
    };

    constructor(public imageService: ImageService,
        private dateService: DateService,
        private statisticsService: StatisticsService,
        private microtextService: MicrotextService) {
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
                        isSelected: false
                    },
                    {
                        text: "בקשות שינוי סיסמא",
                        logType: LOG_TYPE.RESET_PASSWORD_REQUEST,
                        isSelected: false
                    },
                    {
                        text: "משתמשים חדשים",
                        logType: LOG_TYPE.REGISTER,
                        isSelected: false
                    }
                ],
                onClick: function (self: any) {
                    self.OpenModal(this.id);
                    self.SaveCurrentSelectedOption(this.options);
                },
                onCancel: function (self: any) {
                    self.RestoreSelectedOption(this.options);
                },
                onConfirm: function (self: any, options: Array<any>) {
                    self.CloseModal(this.id);

                    let option;

                    for (let i = 0; i < options.length; i++) {
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
                        statisticsRange: STATISTICS_RANGE.WEEKLY,
                        isSelected: true
                    },
                    {
                        text: "שנתית",
                        statisticsRange: STATISTICS_RANGE.YEARLY,
                        isSelected: false
                    }
                ],
                onClick: function (self: any) {
                    self.OpenModal(this.id);
                    self.SaveCurrentSelectedOption(this.options);
                },
                onCancel: function (self: any) {
                    self.RestoreSelectedOption(this.options);
                },
                onConfirm: function (self: any, options: Array<any>) {
                    self.CloseModal(this.id);
                    let option;

                    for (let i = 0; i < options.length; i++) {
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
                isShow: function (self: any) {
                    return (self.chart ? true : false);
                },
                onClick: function (self: any) {
                    self.OpenModal(this.id);
                },
                onCancel: function (self: any) {
                    self.userEmailInput = null;
                    self.isUserEmailFound = null;
                    self.HideMicrotext("email-micro");
                },
                isDisableConfirm: function (self: any) {
                    return (self.userEmailInput ? false : true);
                },
                onConfirm: function (self: any) {
                    if (!this.isLoaderActive &&
                        self.userEmailInput &&
                        self.microtextService.Validation(self.emailValidationFuncs,
                            self.userEmailInput,
                            UserRegexp)) {
                        this.isLoaderActive = true;
                        self.statisticsService.GetUserByEmail(self.userEmailInput).then((result: any) => {
                            this.isLoaderActive = false;

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
                                self.CloseModal(this.id);
                            }
                        });
                    }
                }
            }
        ];
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }

    LoadChart(type: LOG_TYPE, range: STATISTICS_RANGE, chartName: string, datesRange?: Object) {
        this.datesRange = datesRange || this.CalculateDatesRangeByRangeType(range);
        let clientTimeZone = new Date().getTimezoneOffset();
        this.isLoadingChart = true;

        this.statisticsService.GetChartData(type,
            range,
            this.datesRange,
            clientTimeZone,
            this.userEmail).then(data => {
                this.isLoadingChart = false;
                this.InitializeChart(chartName, range, this.datesRange, data);
            });
    }

    InitializeChart(name: string, range: STATISTICS_RANGE, datesRange: Object, data: Array<number>) {
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

    SelectOption(options: Array<any>, index: number) {
        options.forEach(option => {
            option.isSelected = false;
        });

        options[index].isSelected = true;
    }

    OpenModal(modalId: string) {
        $("#" + modalId).modal("show");
    }

    CloseModal(modalId: string) {
        $("#" + modalId).modal("hide");
    }

    SaveCurrentSelectedOption(options: Array<any>) {
        options.forEach((option, index) => {
            if (option.isSelected) {
                this.selectedOptionIndex = index;
            }
        });
    }

    RestoreSelectedOption(options: Array<any>) {
        options.forEach((option, index) => {
            option.isSelected = (index == this.selectedOptionIndex);
        });
    }

    CalculateDatesRangeByRangeType(range: STATISTICS_RANGE): Object {
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

    GetNextDatesRangePeriod() {
        if (this.datesRangeMovementIndex != 0) {
            this.datesRangeMovementIndex++;
            let startDate: Date = this.datesRange["startDate"];
            let endDate: Date = this.datesRange["endDate"];

            switch (this.chartsValues["statisticsRange"]) {
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

            this.LoadChart(this.chartsValues["logType"],
                this.chartsValues["statisticsRange"],
                this.chartsValues["chartName"],
                this.datesRange);
        }
    }

    GetPreviousDatesRangePeriod() {
        this.datesRangeMovementIndex--;
        let startDate = this.datesRange["startDate"];
        let endDate = this.datesRange["endDate"];

        switch (this.chartsValues["statisticsRange"]) {
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

        this.LoadChartAgain(this.datesRange);
    }

    ClearUserChart() {
        // Reset user data.
        Object.keys(this.userData).forEach(key => {
            this.userData[key] = null;
        });

        this.userEmail = null;

        this.LoadChartAgain();
    }

    // Full loading the chart objects and data.
    // May send data range object to control the dates of chart.
    LoadChartAgain(datesRange?: Object) {
        this.LoadChart(this.chartsValues["logType"],
            this.chartsValues["statisticsRange"],
            this.chartsValues["chartName"],
            datesRange);
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