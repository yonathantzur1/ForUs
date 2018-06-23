// Close modal when click back on browser.
$(window).on('popstate', function () {
    $(".modal").modal("hide");
});

(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.get(0).clientHeight;
    }
})(jQuery);

var globalVariables = {
    isTouchDevice: (('ontouchstart' in window || navigator.maxTouchPoints) ? true : false),
    days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
    months: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
    shortMonths: ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יונ'", "יול'", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"]
};

function GetDateDetailsString(localDate, currDate, isShortMonths) {
    currDate.setHours(23, 59, 59, 999);

    var timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    var datesDaysDiff = Math.abs(currDate.getDay() - localDate.getDay());

    var dateDetailsString = "";

    if (diffDays <= 7) {
        if (diffDays <= 2) {
            if (currDate.getDate() == localDate.getDate()) {
                dateDetailsString = "היום";
            }
            else if (Math.min((7 - datesDaysDiff), datesDaysDiff) <= 1) {
                dateDetailsString = "אתמול";
            }
            else {
                dateDetailsString = globalVariables.days[localDate.getDay()];
            }
        }
        else {
            dateDetailsString = globalVariables.days[localDate.getDay()];
        }
    }
    else {
        // In case of the same year or different years but for the first half of year.
        if (localDate.getFullYear() == currDate.getFullYear() || diffDays < (365 / 2)) {
            var monthString = isShortMonths ? globalVariables.shortMonths[localDate.getMonth()] : globalVariables.months[localDate.getMonth()];
            dateDetailsString = (localDate.getDate()) + " ב" + monthString;
        }
        else {
            dateDetailsString = (localDate.getDate()) + "/" + (localDate.getMonth() + 1) + "/" + localDate.getFullYear();
        }
    }

    return dateDetailsString;
}