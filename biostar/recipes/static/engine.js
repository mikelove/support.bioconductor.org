String.prototype.format = String.prototype.f = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function popup_message(elem, msg, cls, timeout) {
    timeout = typeof timeout !== 'undefined' ? timeout : 1000;
    var text = '<div></div>';
    var tag = $(text).insertBefore(elem)
    tag.addClass('popover ' + cls)
    tag.text(msg)
    tag.delay(timeout).fadeOut(500, function () {
        $(this).remove()
    });
}

// Triggered on network errors.
function error_message(elem, xhr, status, text) {
    popup_message(elem, "Error! readyState=" + xhr.readyState + " status=" + status + " text=" + text, "error", timeout = 5000)
}


function snippet_form(elem, is_category){
    let type_name = elem.data('type_name');
    let type_uid = elem.data('type_uid');
    let snippet_uid = elem.data('snippet_uid');
    let snippet = elem.data('snippet');
    let help_text = elem.data('help_text');

    $.ajax('/snippet/form/',{
            type: 'POST',
               dataType: 'json',
               data: {
                    'is_category':is_category,
                    'type_uid': type_uid,
                    'type_name':type_name,
                    'snippet': snippet,
                    'help_text': help_text,
                    'snippet_uid':snippet_uid
               },
               success: function (data) {

                   $('#cmd_form').html(data.html);

                    $('#cmd_modal').modal('show');
                   //$('#search-results').html(data);

               },
               error: function (xhr, status, text) {
                   error_message($(this), xhr, status, text)
               }

            }

        );

}


function add_to_template(elem){

    let snippet = elem.attr('id');
    let template = $('#template').val();
    //alert(snippet);

    $.ajax('/snippet/code/', {
           type: 'POST',
           dataType: 'json',
           data: {
                  'command': snippet,
                  'template':template,
           },

           success: function (data) {
               // Inject the fields into the
               //alert(data.json_text);
               //alert("ffffff")
               if (data.status === 'error') {
                   popup_message($('#template'), data.msg, data.status);
               }
               $('#template').val(data.code);
               $('#template_field').html(data.html);
               //$('#search-results').html(data);
           },
           error: function () {
               error_message($(this), xhr, status, text)
           }
       });
}


function check_job() {

    // Look at each job with a 'check_back' tag
    $('.check_back').each(function () {
        // Get the uid and state
        var job_uid = $(this).data('value');
        var state = $(this).data('state');
        // Bail out when a job uid is not provided.
        if (job_uid === null || job_uid === undefined) {
            return
        }

        // Ajax request checking state change and replace appropriate element.
        $.ajax('/ajax/check/job/' + job_uid + '/', {
            type: 'GET',
            dataType: 'json',
            data: {'state': state},
            ContentType: 'application/json',
            success: function (data) {
                // Only replace and activate effects when the state has actually changed.
                if (data.state_changed) {
                    $('.job-container-' + job_uid).html(data.html);
                    var job_item = $('.job-item-' + job_uid);
                    job_item.transition('pulse');
                }
            },
            error: function (xhr, status, text) {
            error_message($(this), xhr, status, text)
        }
        })
    });

}


function preview_template(uid, project_uid){
         let template = $('#template').val();
         let json_text = $('#json').val();
         let name = $('#id_name').val();
         $.ajax('/preview/template/',
             {
             type: 'POST',
                dataType: 'json',
                ContentType: 'application/json',
                data: {
                       'template': template,
                       'json_text': json_text,
                       'name' : name,
                       'uid' : uid,
                       'project_uid': project_uid
                },
                success: function (data) {

                 if (data.status === 'success'){
                     $('#template_preview_cont').html(data.html);
                     $('#template_modal').modal('show');
                     Prism.highlightAll();
                     return
                 }

                popup_message($("#template"), data.msg, data.status );
                },
                error: function (xhr, status, text) {
                 error_message( $(this), xhr, status, text)
                }

                });
}

function save_snippet_category(){
        var form_data = new FormData($('#snippet_form').get(0));

        $.ajax('/create/snippet/type/',{
            type: 'POST',
               dataType: 'json',
               data: form_data,
               processData: false,
               contentType: false,
               success: function (data) {
                   if (data.status === 'success'){
                       $('#new-type-holder').after(data.html);
                       $('#cmd_modal').modal('hide');
                   }else{

                       popup_message($('#cmd_form'), data.msg, data.status, 1000)
                   }

               },
               error: function (xhr, status, text) {
                   error_message($(this), xhr, status, text)
               }
            }
        )


}

function add_to_interface(display_type){

       let json_text = $('#json').val();
       //let display_type = $(this).attr('id');

       $.ajax('/add/recipe/fields/', {
               type: 'POST',
               dataType: 'json',
               data: {
                      'display_types': display_type,
                      'json_text': json_text,
               },

               success: function (data) {
                   $('#json').val(data.json_text);
                   $('#json_field').html(data.html);


                   //$('#search-results').html(data);
               },
               error: function (xhr, status, text) {
                   error_message($(this), xhr, status, text)
               }
           });


}


function add_vars(){
        let json_text = $('#json').val();
        let template = $('#template').val();

        $.ajax('/add/vars/',{
               type: 'POST',
               dataType: 'json',
               data: {
                      'json_text': json_text,
                      'template':template,
               },

               success: function (data) {

                   $('#template').val(data.code);
                   $('#template_field').html(data.html);

               },
               error: function () {
               }
           }

        )
}



function json_preview(project_uid){
         //let project_uid = $(this).data('value');
         let recipe_json = $('#json').val();
         $.ajax('/preview/json/',
             {
                type: 'POST',
                dataType: 'json',
                ContentType: 'application/json',
                data: {'project_uid': project_uid,
                       'json_text': recipe_json},

                success: function (data) {

                 if (data.status === 'error'){
                     popup_message($("#json_field"), data.msg, data.status, 5000 );
                     return
                 }

                 $('#json_preview_cont').html('<form class="ui inputcolor form">'+data.html+'<div class="field">\n' +
                     '                        <button type="submit" class="ui green disabled button">\n' +
                     '                            <i class="check icon"></i>Run\n' +
                     '                        </button>\n' +
                     '\n' +
                     '                        <a class="ui disabled button">\n' +
                     '                            <i class="redo icon"></i>Cancel\n' +
                     '                        </a>\n' +
                     '                    </div></form>'.format(data.html));

                 //$('#json_preview_cont').children('.ui.dropdown').css("color", 'red !important');
                //$('#json_modal').show();
                 //$('#id_dropdown').dropdown({ showOnFocus:false });
                 //$('#id_dropdown').hide()
                $('#json_modal').modal({autofocus:false}).modal('show')

                //pop_over($("#copy-message-"+ data_uid), data.msg, data.status );
                },

                error: function (xhr, status, text) {
                 error_message( $(this), xhr, status, text)
                }

                });
}

function create_snippet(elem){
    let type = elem.data('type');
    let snippet_uid = elem.data('snippet_uid');
    let snippet = $('#snippet').val();
    let help_text = $('#help').val();

    $.ajax('/create/snippet/', {

            type: 'POST',
            dataType: 'json',
            data: {
                'snippet': snippet,
                'help_text': help_text,
                'type_uid': type,
                'snippet_uid': snippet_uid
            },
            success: function (data) {
                if (data.status === 'success') {

                    if (snippet_uid.length){
                        $('#item-' + snippet_uid).html(data.html);
                    }else {
                        $('.holder-' + type).after(data.html);
                    }
                    $('#cmd_modal').modal('hide');

                } else {

                    popup_message($('#snippet'), data.msg, data.status, 1000)
                }

            },
            error: function (xhr, status, text) {
                error_message($(this), xhr, status, text)
            }
        }
    )
}
function remove_trigger() {
    // Makes site messages dissapear.
    $('.remove').delay(2000).slideUp(800, function () {
        $(this).remove();
    });
}


function set_source_dir() {
    let current_source = $('#current_source');
    if (!current_source.val().length) {
        window.location.href = '/root/list/';
        return
    }
    window.location.href = '/file/list/' + current_source.val();
}



function copy_file(path){
    let elem = $('.copy_msg[data-path="'+ path +'"]');

    $.ajax('/file/copy/', {
            type: 'POST',
            dataType: 'json',
            data: {
                'path':path
            },

            success: function (data) {
                if (data.status ==='success'){

                    popup_message(elem, data.msg, data.status, 500);
                }
                popup_message(elem, data.msg, data.status, 2000)

            },
            error: function () {
            }
        }
    )
}

$(document).ready(function () {


    $('.ui.dropdown').dropdown();
    $('select').dropdown();

    $('#json_add').dropdown();

    $('#code_add').dropdown();

     $('.ui.sticky').sticky();

     $(this).on('click', '#json_preview', function () {
          event.preventDefault();
         let project_uid = $(this).data('value');

         json_preview(project_uid);
         $('.ui.dropdown').dropdown();
          $('select').dropdown();

    });

    remove_trigger();

    // Check and update 'Running' and 'Spooled' jobs every 20 seconds.
    setInterval(check_job, 5000 );

    $(".copy-data").click(function (event) {

        var elem = $(this);
        var data_uid = elem.attr('data-uid');
        var copy_url = elem.attr('copy-url');

        $.ajax(copy_url, {
                type: 'GET',
                dataType: 'json',
                ContentType: 'application/json',
                data: {data_uid: data_uid},
                success: function (data) {
                popup_message($("#copy-message-"+ data_uid), data.msg, data.status );
                },
                error: function () {
                }
                });
    });

    $('#recipe-search').keyup(function(){

        var query = $(this).val();

        $.ajax("/search/", {
            type: 'GET',
            dataType: 'html',

            data: {'q': query},

            success: function (data) {
            $('#search-results').html(data);
            },
            error: function () {
            }
            });

    });

    $('#json_add_menu .item').popup({
        on:'hover'
    });
    $('.delete-snippet').popup({
        on:'hover',
    });
    $('.edit-snippet').popup({
        on:'hover',
    });


    $('.cmd-value').popup({
        on:'hover'
    });

    $('#code_add_menu .item').popup({
        on:'hover'
    });

    $('.close_opts').click(function () {
        $('#json_add').dropdown({onShow:false});
    });

    $('.close_codes').click(function () {
        $('#code_add').dropdown({
            onShow: function () {
                return false
            }
        })
    });

    $(this).on('click', '#add_vars', function() {
        add_vars()
    });

    $(this).on('click', '.cmd-value', function() {
        event.preventDefault();
        add_to_template($(this))
    });

    $(this).on('click', '.add_to_interface', function () {
        event.preventDefault();
        let display_type = $(this).attr('id');
        add_to_interface(display_type)

    });

    $(this).on('click', '#save_snippet_type', function() {
        save_snippet_category()

    });

    $(this).on('click', '#save_command', function() {
        create_snippet($(this));

    });

    $(this).on('click', '#template_preview', function () {
         event.preventDefault();
         let uid = $(this).data('value');
         let project_uid = $(this).data('project_uid');
         preview_template(uid, project_uid)

    });

    $(this).on('click', '.add-snippet', function () {
        snippet_form($(this), 0);
    });

    $(this).on('click', '.edit-snippet', function () {
        snippet_form($(this), 0);
    });

    $(this).on('click', '.add-category', function () {
        snippet_form($(this), 1);
    });

    $(this).on('keyup', '#current_source', function (event) {
        // Submit when pressing enter
         if (event.keyCode === 13) {
             set_source_dir()
         }
    });

    $(this).on('click', '#set_source', function () {
        set_source_dir()

    });


    $(this).on('click', '.copy_file', function () {
        let path = $(this).data('path');
        copy_file(path)
    });


});