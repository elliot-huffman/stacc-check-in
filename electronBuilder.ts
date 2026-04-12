import type { Configuration } from "electron-builder";

/** Electron compile settings used to convert the compiled files to platform binaries. */
const builderConfig: Configuration = {
    'appId': 'me.huffman.elliot.check-in',
    'productName': 'elHuff - Check-In',
    'copyright': 'Copyright © 2026 Elliot Huffman',
    'executableName': 'Check-In',
    'electronFuses': {
        'enableCookieEncryption': true,
        'enableEmbeddedAsarIntegrityValidation': true,
        'enableNodeCliInspectArguments': false,
        'enableNodeOptionsEnvironmentVariable': false,
        'grantFileProtocolExtraPrivileges': false,
        // 'loadBrowserProcessSpecificV8Snapshot': true,
        'onlyLoadAppFromAsar': true,
        'runAsNode': false
    },
    'files': [
        "bin",
        "!bin/tsconfig.tsbuildinfo",
        "user-interface/out"
    ],
    'protocols': {
        'name': 'elHuff - Check-In',
        'schemes': ['check-in']
    },
    'win': {
        'compression': 'maximum',
        'icon': 'assets/Logo.ico',
        'target': [
            {
                'target': 'dir',
                'arch': [
                    'x64',
                    'arm64'
                ]
            }
        ]
    }
};

// Expose the configuration to be used by electron-builder when compiling the binaries.
export default builderConfig;
