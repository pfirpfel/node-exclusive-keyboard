{
    'targets': [
        {
            'target_name': 'ioctl',
            'sources': [ 'lib/ioctl.cpp' ],
            'include_dirs': [
                '<!(node -e "require(\'nan\')")'
            ]
        }
    ]
}
