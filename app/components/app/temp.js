$(window).on('popstate', function() {
    $(".modal").modal("hide");
});

(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);