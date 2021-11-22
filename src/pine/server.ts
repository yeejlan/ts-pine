import http from 'http';
import {injectable} from 'inversify';
import {container} from './container';
import {app} from './app';
import {router} from './router';

@injectable()
export class Server {

    serve(port: number = 8080) {
        let server = http.createServer(function(request, response) {
            try{
                router.dispatch(request, response);
            }catch(err){
                response.end();
                request.socket.destroy();                
                let estr = '';
                if(err instanceof Error){
                    estr = err.stack ?? err.message;
                }else{
                    estr = String(err);
                }
                logger.error("Server dispatch error: %s", estr);
            }
        });

        let logger = app.logger;
        let shutdown = function() {
            //force shutdown
            let shutdownTimer = setTimeout(function() {
                logger.warn("Server force closed after timeout");
                process.exit(0);
            }, 15000);
            server.close(function onServerClosed (err){
                if (err) {
                    logger.error("Server close error: %s", err);
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
            logger.error("server listen error: %s", err);
            process.exit(1);
        });
        if(server.listening){
            logger.info("Server listen on %s", port);
        }
    }
}

export const server = container.get(Server);
