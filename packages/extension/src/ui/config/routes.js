import Home from '~/ui/views/Home';
import Register from '~/ui/pages/Register';
import DomainPermission from '~/ui/pages/DomainPermission';
import Account from '~/ui/pages/Account';
import Restore from '~/ui/pages/Restore';
import Login from '~/ui/pages/Login';
import NoteAccess from '~/ui/pages/NoteAccess';
import Deposit from '~/ui/pages/Deposit';
import Withdraw from '~/ui/pages/Withdraw';
import Send from '~/ui/pages/Send';

export default {
    _: {
        Component: Home,
    },
    register: {
        path: 'register',
        Component: Register,
        routes: {
            address: {
                path: 'address',
                Component: Register,
            },
            domain: {
                path: 'domain',
                Component: DomainPermission,
            },
        },
    },
    account: {
        path: 'account',
        Component: Account,
        routes: {
            restore: {
                path: 'restore',
                Component: Restore,
            },
            login: {
                path: 'login',
                Component: Login,
            },
        },
    },
    deposit: {
        path: 'deposit',
        Component: Deposit,
    },
    withdraw: {
        path: 'withdraw',
        Component: Withdraw,
    },
    noteAccess: {
        path: 'note-access',
        Component: NoteAccess,
    },
    send: {
        path: 'send',
        Component: Send,
    },
};
