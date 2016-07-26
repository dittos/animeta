import timeit


class PerfMeasureMiddleware(object):
    def process_request(self, request):
        request._start_time = timeit.default_timer()

    def process_response(self, request, response):
        response['x-processing-time'] = timeit.default_timer() - request._start_time
        return response
