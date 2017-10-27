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