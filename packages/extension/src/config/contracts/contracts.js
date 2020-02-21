export default {
    AccountRegistry: {
        name: 'Behaviour20200106',
        events: {
            registerExtension: 'RegisterExtension',
        },
        isProxyContract: true,
        managerContractName: 'AccountRegistryManager',
    },
    AccountRegistryManager: {
        name: 'AccountRegistryManager',
    },
    ACE: {
        name: 'ACE',
        events: {
            createNoteRegistry: 'CreateNoteRegistry',
        },
    },
    ZkAsset: {
        name: 'IZkAsset',
        events: {
            createNote: 'CreateNote',
            updateNoteMetaData: 'UpdateNoteMetaData',
            destroyNote: 'DestroyNote',
        },
    },
    ERC20: {
        name: 'ERC20',
    },
};
