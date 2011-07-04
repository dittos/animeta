$(function () {
    $('#id_work_title, .autocomplete').autocomplete({
        source: function (request, callback) {
            $.getJSON('/api/v1/works', {match: 'prefix', sort: 'popular', count: 10, keyword: request.term}, function (data) {
                callback($.map(data, function (work) { return work.title }))
            })
        }
    })

/*
    $('a.dialog').live('click', function() {
        if ($('#dialog').length == 0)
            $('<div id="dialog" style="display: none"></div>').appendTo('body')
        var url = this.getAttribute('href')
        $('#dialog').load(url, function (content) {
            var $dialog = $('#dialog')
            $dialog.find('form[action=""]').attr('action', url)
            $dialog.dialog()
        })
        return false
    })
*/
})
