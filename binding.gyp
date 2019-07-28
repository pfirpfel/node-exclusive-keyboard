{
    'targets': [
        {
            'target_name': 'eviocgrab',
            'sources': [ 'lib/eviocgrab.cpp' ],
            'include_dirs': [
                '<!(node -e "require(\'nan\')")'
            ]
        }
    ]
}
