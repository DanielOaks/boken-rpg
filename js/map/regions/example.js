export var region = {
    'name': 'Examplora',
    'defaultPlace': 'ship',
    'places': {
        'ship': {
            'desc': `Your ship sits here, some workers scurrying about.\n\nTo the south is a walkway towards the town proper.`,
            'links': {
                's': 'shipWalkway1',
            },
        },
        'shipWalkway1': {
            'desc': `There's a walkway overlooking both some of the ships being built and the desert far, far below you.`,
            'links': {
                'w': 'ship',
            }
        },
    },
}