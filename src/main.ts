import dotenv from 'dotenv';
dotenv.config();

import {App} from './pine/app';

async function main() {
    const app = App();
    await app.bootstrap();
}

main();
