import 'reflect-metadata';
import { Container as InversifyContainer } from 'inversify';

const container = new InversifyContainer({ autoBindInjectable: true });

export function Container() {
    return container;
}

