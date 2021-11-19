import dotenv from 'dotenv';
dotenv.config();

import {App} from './pine/app';

const app = App();

async function main() {
    await app.bootstrap();
}

main();

app.shutdown();
