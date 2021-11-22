export interface PineError extends Error {
    type: string,
    code: number,
}

export class PineError extends Error implements PineError {
    type: string = PineError.name;
    code: number = 1000;
};


