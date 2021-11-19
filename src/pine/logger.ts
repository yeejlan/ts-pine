import {pino} from 'pino';
import {injectable} from 'inversify';
import {DateTime} from 'luxon';
import {Container} from './container';
import {env} from './function'

export interface Logger {
    open(): void;
    close(): void;
    debug(mesasage: any, ...params: any[]): void;
    info(mesasage: any, ...params: any[]): void;
    warn(mesasage: any, ...params: any[]): void;
    error(mesasage: any, ...params: any[]): void;
    fatal(mesasage: any, ...params: any[]): void;
}

@injectable()
export class PineLogger implements Logger {
    private logger: pino.Logger;

    constructor() {
        const formatters = {
            level (label: string, _: number) {
              return { level: label }
            }
        };
        this.logger = pino({
            level: env('log_level', 'info'),
            timestamp: () => `,"time":"${DateTime.now().toISO()}"`,
            formatters: formatters,
        });
    }

    open(){}

    close(){}

    debug(mesasage: any, ...params: any[]){
        this.logger.debug(mesasage, ...params);
    }

    info(mesasage: any, ...params: any[]){
        this.logger.info(mesasage, ...params);
    }

    warn(mesasage: any, ...params: any[]){
        this.logger.warn(mesasage, ...params);
    }

    error(mesasage: any, ...params: any[]){
        this.logger.error(mesasage, ...params);
    }

    fatal(mesasage: any, ...params: any[]){
        this.logger.fatal(mesasage, ...params);
    }
}

const logger: Logger = Container().get(PineLogger)
logger.open();

export function Logger() {
    return logger;
}        
