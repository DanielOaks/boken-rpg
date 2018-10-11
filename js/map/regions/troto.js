export var region = {
    'name': 'Troto',
    'defaultPlace': 'entrance',
    'places': {
        'castleInnerEntrance': {
            'desc': `.`,
            'links': {
                'n': '',
                's': '',
                'e': '',
                'w': 'castleCourtyard',
            },
        },
        'castleCourtyard': {
            'desc': `.`,
            'links': {
                'n': 'castleCourtyard1',
                's': 'castleCourtyard2',
                'e': 'castleInnerEntrance',
                'w': 'castleEntrance',
            },
        },
        'castleCourtyard1': {
            'desc': `.`,
            'links': {
                'n': '',
                's': 'castleCourtyard',
                'e': '',
                'w': '',
            },
        },
        'castleCourtyard2': {
            'desc': `.`,
            'links': {
                'n': 'castleCourtyard',
                's': '',
                'e': '',
                'w': '',
            },
        },
        'castleEntrance': {
            'desc': `Two guards stand here, each giving you a nod..`,
            'character': true,
            'scenes': [
                {
                    'name': 'Guards',
                    'description': 'Talk to the gate guards',
                    'scene': 'troto_gate_guards',
                }
            ],
            'links': {
                'n': '',
                's': '',
                'e': 'castleCourtyard',
                'w': 'town1',
            },
        },
        'town1': {
            'desc': `.`,
            'links': {
                'n': 'townUpper1',
                's': 'townLower1',
                'e': 'castleEntrance',
                'w': '',
            },
        },
        'townUpper1': {
            'desc': `.`,
            'links': {
                'n': '',
                's': 'town1',
                'e': '',
                'w': 'townUpper2',
            },
        },
        'townUpper2': {
            'desc': `.`,
            'links': {
                'n': 'townHouse2',
                's': '',
                'e': 'townUpper1',
                'w': 'townHouse1',
            },
        },
        'townHouse1': {
            'desc': `.`,
            'links': {
                'n': '',
                's': '',
                'e': 'townUpper2',
                'w': '',
            },
        },
        'townHouse2': {
            'desc': `.`,
            'links': {
                'n': '',
                's': 'townUpper2',
                'e': '',
                'w': '',
            },
        },
        'entrance': {
            'desc': `.`,
            'links': {
                'n': '',
                's': '',
                'e': '',
                'w': '',
            },
        },
        // '': {
        //     'desc': `.`,
        //     'links': {
        //         'n': '',
        //         's': '',
        //         'e': '',
        //         'w': '',
        //     },
        // },
    },
}