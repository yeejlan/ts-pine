import http from 'http';
import {injectable} from 'inversify';
import {container} from './container';
import {app} from './app';
import {router} from './router';

@injectable()
export class Server {

    serve(port: number = 8080) {
        let server = http.createServer(function(request, response) {
            router.dispatch(request, response);
        });

        let logger = app.logger;
        let shutdown = function() {
            //force shutdown
            let shutdownTimer = setTimeout(function() {
                logger.warn("server force closed after timeout");
                process.exit(0);
            }, 15000);
            server.close(function onServerClosed (err){
                if (err) {
                    logger.error("server.close error: %s", err);
                    process.exit(1);
                }else {
                    app.shutdown();
                    clearTimeout(shutdownTimer);
                    process.exit(0);
                }
            });
        }
        process.on('SIGTERM', function onSigterm () {
            logger.info('Got SIGTERM, server shutting down');
            shutdown();
        });

        process.on('SIGINT', function onSigterm () {
            if(app.debug === true) {
                process.exit(0);
            }
            logger.info('Got SIGINT, server shutting down');
            shutdown();
        });

        server.listen(port);
        server.on('error', (err) => {
            logger.error("server.listen error: %s", err);
            process.exit(1);
        });
        if(server.listening){
            logger.info("Server listen on %s", port);
        }
    }
}

export const server = container.get(Server);