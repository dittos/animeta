from record.templatetags.status import status_text

def get_connected_services(user):
    from connect import twitter, fb as facebook
    services = []
    for service in (twitter, facebook):
        if getattr(service, 'available', True):
            setting = service.get_setting(user)
            if setting:
                services.append(service.name.lower())
    return services

def post_history(history, services):
    from connect import twitter, fb as facebook
    kwargs = {
        'title': history.record.title,
        'status': status_text(history),
        'url': 'http://animeta.net/-%d' % history.id,
        'comment': history.comment,
    }

    success = []
    for name, module in ('twitter', twitter), ('facebook', facebook):
        if name not in services: continue

        setting = module.get_setting(history.user)
        if not setting: continue
        
        ok = module.post_history(module.get_setting(history.user), **kwargs)
        if ok:
            success.append(name)
    return success
