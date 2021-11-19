import dotenv from 'dotenv';
dotenv.config();

import {app} from './pine/app';

async function main() {
    await app.bootstrap();
}

main();

app.shutdown();
