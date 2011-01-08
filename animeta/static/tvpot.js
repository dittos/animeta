function TVPot(api_key) {
	this.API_KEY = api_key
	this.results_per_page = 6
	this.page = 1
}

TVPot.prototype.search = function() {
	var s = document.createElement('script')
	s.type = 'text/javascript'
	s.charset = 'utf-8'
	s.src = 'http://apis.daum.net/search/vclip?apikey=' + this.API_KEY +
			'&output=json&callback=tvpot.search_complete&sort=exact' +
			'&result=' + this.results_per_page +
			'&q=' + encodeURI(this.q) +
			'&pageno=' + this.page
	$('head').append(s)
}

function format_date(t) {
	var d = new Date(parseInt(t.substr(0,4), 10), parseInt(t.substr(4,2), 10) - 1, parseInt(t.substr(6,2), 10))
	return d.toLocaleDateString()
}

function shorten(str, limit) {
	if (!limit) limit = 30
	return (str.length > limit) ? str.substr(0, limit) + '...' : str
}

TVPot.prototype.search_complete = function(data) {
	var items = data.channel.item
	var markup = '<table id="tvpot-page' + this.page + '"><tr>'
	for (var i = 0; i < items.length; i++) {
		if (i > 0 && i % 3 == 0) markup += '</tr><tr>'
		var item = items[i]
		var url = 'videos/tvpot/' + item.player_url.split('?vid=')[1] + '/'
		markup += 
			'<td>' + '<a href="' + url + '">' + '<img src="' + item.thumbnail + '" alt="' + item.title + '" class="thumbnail" />' +
			'<a href="' + url + '" class="title">' + shorten(item.title) + '</a>' +
			'<span class="date">' + format_date(item.pubDate) + '</span></td>'
	}
	markup += '</tr></table>'
	if (this.page > 1)
		markup += '<a href="#tvpot-page' + (this.page - 1) + '" onclick="tvpot.prev_page()" id="tvpot-page' + (this.page - 1) + '">이전</a> | '
	markup += '<a href="#tvpot-page' + (this.page + 1) + '" onclick="tvpot.next_page()" id="tvpot-page' + (this.page + 1) + '">다음</a>'
	this.$element.html(markup)
}

TVPot.prototype.prev_page = function() {
	this.page--
	this.search()
}

TVPot.prototype.next_page = function() {
	this.page++
	this.search()
}
