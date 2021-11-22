import dotenv from 'dotenv';
dotenv.config();

import {app, server} from './pine';

async function main() {
    await app.bootstrap();
    server.serve();
}

main();




