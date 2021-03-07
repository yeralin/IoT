entity_id = data.get('entity_id')
service = data.get('service')
location = data.get('location')
repeats = data.get('repeats', 1)

if entity_id and service and location:
    domain, action = service.split('.')
    zone = []
    if location == 'living_room':
        zone = [[22274,22023,26174,26773]]
    elif location == 'litter_box':
        zone = [[24486,25185,25536,26785]]
    elif location == 'kitchen' :
        zone = [[23463,19862,26113,21262]]
    elif location == 'bathroom':
        zone = [[19746,19390,21496,21090]]
    elif location == 'bedroom':
        zone = [[18766,22400,22266,27200]]
    elif location == 'entrance':
        zone = [[22381,19332,23731,21282]]
    elif location == 'hall':
        zone = [[20267,21190,23717,22340]]
    else:
        raise Exception("Location \"{}\" is not recognized".format(location))
    service_data = {'zone': zone, 'repeats': repeats}
    hass.services.call(domain, action, service_data, False)