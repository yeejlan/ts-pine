# ts-pine

A typescript node app demo.

# Quick start

```bash
cp .env.example .env
yarn install
yarn dev
```
# More

Please check src/pine and src/hex/controller/home.controller for detail.

```typescript
import dotenv from 'dotenv';
dotenv.config();

import {app, server, router, container} from './pine';

import * as controllers from './controller';
import {MyHomeController} from './hex/controller/home.controller';

container.bind(controllers.HomeController).to(MyHomeController);

async function main() {
    await app.bootstrap();
    router.setControllers(controllers);
    router.addRoute('/hello/(.*)', 'home/echo', {1: 'user'});
    server.serve();
}

main();
```
