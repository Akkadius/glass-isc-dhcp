/**
 * Created by cmiles on 8/9/2017.
 */

var loader_html = '<div class="preloader"> \
    <div class="spinner-layer pl-light-blue"> \
    <div class="circle-clipper left"> \
    <div class="circle"></div> \
    </div> \
    <div class="circle-clipper right"> \
    <div class="circle"></div> \
    </div> \
    </div> \
    </div>';

$(document).ready(function () {
    remove_init_form();

    /* Remove 'active' class from 'li' items */
    setTimeout(function(){
        $('li.active').removeClass("active");

        $('.list > li').each(function(){
            var href = $(this).find('a').attr("href");
            if(typeof href !== "undefined"){
                // console.log(href);
                // console.log(document.location.pathname);

                if(href == document.location.pathname){
                    $(this).addClass("active");
                }
            }
        });
    }, 500);
});

/*
 * When a sidebar item is clicked - let's make sure we set the active/inactive components
 */

$(document).on('on_pjax_click', function (e, href) {
    $('li.active').removeClass("active");
    href.parent('li').addClass("active");
});

/*
 * When a sidebar item is clicked in mobile - let's make sure we push the sidebar back in
 */
$(document).on('on_pjax_complete', function (e) {
    if ($('.ls-closed').length > 0) {
        $('body').removeClass('overlay-open');
        $('.overlay').css("display", "none");
    }

    /*
     * Form input focus event
     */
    $('.form-control').focus(function () {
        $(this).parent().addClass('focused');
    });

    //On focusout event
    $('.form-control').focusout(function () {
        var $this = $(this);
        if ($this.parents('.form-group').hasClass('form-float')) {
            if ($this.val() == '') {
                $this.parents('.form-line').removeClass('focused');
            }
        }
        else {
            $this.parents('.form-line').removeClass('focused');
        }
    });

    //On label click
    $('body').on('click', '.form-float .form-line .form-label', function () {
        $(this).parent().find('input').focus();
    });

    //Not blank form
    $('.form-control').each(function () {
        if ($(this).val() !== '') {
            $(this).parents('.form-line').addClass('focused');
        }
    });

    remove_init_form();

    remove_init_form();
});

function remove_init_form() {
    setTimeout(function () {
        $('.form-line').removeClass("focused");
    }, 10);
}

function modal(title, content, buttons) {
    $('#modal-buttons').html('');
    $('#modal-title').html(title);
    $('#modal-body').html(content);

    // <button type="button" class="btn btn-link waves-effect">SAVE CHANGES</button>
    if (buttons != '') {
        $('#modal-buttons').html(buttons);
    }
    $('#mdModal').modal('show');
}

function get_form_query_string(form_id) {
    query_string = "";
    $('#' + form_id).find('input, select, textarea').each(function (key) {
        val = $(this).val();
        if (val == 'undefined') {
            val = '';
        }
        if ($(this).attr('type') == "checkbox") {
            if (!$(this).is(':checked')) {
                val = 0;
            }
        }
        query_string = query_string + "&" + $(this).attr('id') + "=" + encodeURIComponent(val);
    });
    return query_string;
}

function save_config() {
    glass_settings = get_form_query_string("glass-settings-form");

    $.post("/glass_settings_save", glass_settings, function (data) {
        $("#glass_settings_result").html(data);
    });
}

function notification(text) {
    colorName = 'bg-black';
    animateEnter = 'animated fadeInDown';
    animateExit = 'animated fadeOutUp';
    var allowDismiss = true;

    $.notify({
            message: text
        },
        {
            type: colorName,
            allow_dismiss: allowDismiss,
            newest_on_top: true,
            timer: 1000,
            animate: {
                enter: animateEnter,
                exit: animateExit
            },
            template: '<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0} ' + (allowDismiss ? "p-r-35" : "") + '" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            '<span data-notify="icon"></span> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>'
        });
}

function change_favicon(img) {
    var favicon = document.querySelector('link[rel="shortcut icon"]');

    if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'shortcut icon');
        var head = document.querySelector('head');
        head.appendChild(favicon);
    }

    favicon.setAttribute('type', 'image/png');
    favicon.setAttribute('href', img);
}

$(document).on("click", ".option_data", function () {
    var lease = $(this).attr("lease");
    if ($("#" + lease).is(":visible")) {
        $("#" + lease).hide();
        $(this).text('Show');
    } else if ($("#" + lease).is(":hidden")) {
        $("#" + lease).show();
        $(this).text('Hide');
    }
});

$(document).on("keypress", "#lease_search_criteria", function (e) {
    if (e.which == 13) {
        $('#search_result').html(loader_html);
        $.post("/dhcp_lease_search", {search: $("#lease_search_criteria").val()}, function (result) {
            $("#search_result").html(result);

            if (typeof display_leases !== "undefined")
                display_leases.destroy();

            display_leases = $('#display-leases').DataTable({
                dom: 'tip',
                responsive: true,
                "pageLength": 100,
                "aaSorting": []
            });
        });
    }
});