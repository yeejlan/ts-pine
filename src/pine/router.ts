import {injectable} from 'inversify';
import {container} from './container';
import {app} from './app';

@injectable()
export class Router {


	// setController(controller) {
	// 	this._controller = controller || {}
	// }    
}

export const router = container.get(Router);
