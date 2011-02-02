$(function () {
	$('#id_work_title, .autocomplete').autocomplete({
		source: function (request, callback) {
			$.getJSON('/api/v1/works', {match: 'prefix', sort: 'popular', count: 10, keyword: request.term}, function (data) {
				callback($.map(data, function (work) { return work.title }))
			})
		}
	})
})
