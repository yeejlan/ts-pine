import {injectable} from 'inversify';
import {container} from './container';
import {app} from './app';

export interface Rule {
    regex: RegExp,
    rewriteTo: string,
    paramMapping: Map<number, any>
}

@injectable()
export class Router {
    protected routers: Rule[] = [];

    addRoute(regex: RegExp, rewriteTo: string, paramMapping: Map<number, any>) {
        let rule: Rule = {
            regex: regex,
            rewriteTo: rewriteTo,
            paramMapping: paramMapping
        };
        this.routers.push(rule);
    }

}

export const router = container.get(Router);
