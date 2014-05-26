/*jslint browser: true, indent: 4, regexp: true*/
/*global $, libsb*/

$(function() {
    // Navigate between columns
    $(".rooms-button").on("click", function() {
        if ($("body").hasClass("view-rooms")) {
            libsb.emit('navigate', { view: "meta", source: "rooms-button" });
        } else {
            libsb.emit('navigate', { view: "rooms", source: "rooms-button" });
        }
    });

    $(".meta-button").on("click", function() {
        if ($("body").hasClass("view-meta")) {
            libsb.emit('navigate', { view: "normal", source: "meta-button" });
        } else {
            libsb.emit('navigate', { view: "meta", source: "meta-button" });
        }
    });

    // Handle swipe gestures
    $(document).on("swipeleft", function() {
        if ($("body").hasClass("view-rooms")) {
            libsb.emit('navigate', { view: "meta", source: "swipe-left" });
        } else {
            libsb.emit('navigate', { view: "normal", source: "swipe-left" });
        }
    });

    $(document).on("swiperight", function() {
        if ($("body").hasClass("view-meta")) {
            libsb.emit('navigate', { view: "rooms", source: "swipe-right" });
        } else {
            libsb.emit('navigate', { view: "meta", source: "swipe-right" });
        }
    });


    // libsb.on('navigate', function(state, next) {
    //     console.log(state);
    //     if(state.view == "normal") {
    //         $("body").removeClass("view-meta").removeClass("view-rooms");
    //     }
    //     next();
    // },100);
});
