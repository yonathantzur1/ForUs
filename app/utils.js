$(window).on('popstate', function () {
    $(".modal").modal("hide");
});

(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.get(0).clientHeight;
    }
})(jQuery);

var isTouchDevice = (('ontouchstart' in window || navigator.maxTouchPoints) ? true : false);