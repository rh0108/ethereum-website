import {
    randomInt,
} from '~utils/random';
import sleep from '~utils/sleep';
import * as ace from './ace';
import * as asset from './asset';
import * as auth from './auth';
import * as note from './note';
import * as proof from './proof';

export default {
    mock: async (data) => {
        await sleep(randomInt(2000));
        const fakeData = {
            ...data,
            mock: true,
            timestamp: Date.now(),
        };
        return fakeData;
    },
    ace,
    asset,
    auth,
    note,
    proof,
};
