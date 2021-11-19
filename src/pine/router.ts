import {injectable} from 'inversify';
import {Container} from './container';
import {app} from './app';

@injectable()
export class Router {


	// setController(controller) {
	// 	this._controller = controller || {}
	// }    
}

export const router = Container().get(Router);
