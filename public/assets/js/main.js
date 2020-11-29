!(function ($) {
    
    // hamburger menu show navigation
    $(document).ready(function () {
        $(".menu-icon").on("click", function () {
            $("nav ul").toggleClass("showing");
        });
    });
    
    // menu scrolling effect to solid color
    $(window).on("scroll", function () {
        if ($(window).scrollTop()) {
            $('nav').addClass('nav-color');
        } else {
            $('nav').removeClass('nav-color');
        }
    })
    
    
    
    $('.active-image-carousel').owlCarousel({
        loop: true,
        nav:true,
        dots: false,
        autoplay: true,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1
            },
            480: {
                items: 1,
            },
            768: {
                items: 2,
            },
            900: {
                items: 4,
            }

        }
    });

})(jQuery);