import {throwError} from './error';

class MyException {};

it('throwError', () => {
    expect(() => throwError(MyException.name, 'my error', 3210)).toThrowError('my error');
    
    try{
        throwError(MyException.name, 'my error', 3210)
    }catch(e){
        expect(e instanceof Error).toBe(true);
        if(e instanceof Error){
            expect(e.type).toBe(MyException.name);
            expect(e.code).toBe(3210);
        }
    }
});

