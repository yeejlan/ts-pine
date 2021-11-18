export interface PineError extends Error {
    type: string,
    code: number,
}

export class PineError extends Error implements PineError {
    type: string = PineError.name;
    code: number = 1000;
};

export class AuthException {};
export class ControllerException {};
export class DbException {};
export class ServiceException {};
export class UserException {};

export class NotFoundException {};
export class InterServerErrorException {};

