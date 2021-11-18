import {env, envNumber, envBool} from './env';

it('env', () => {
    expect(env('app_name')).toBe('pine-lib');
    //with cache
    expect(env('app_name')).toBe('pine-lib');
});

it('env with default value', () => {
    expect(env('not_exist')).toBe('');
    expect(env('not_exist', 'myval')).toBe('myval');
});

it('envNumber', () => {
    expect(envNumber('cache_expired_seconds')).toBe(3600);
    expect(envNumber('app_name')).toBe(0);
});

it('envNumber with default value', () => {
    expect(envNumber('not_exist', 12345)).toBe(12345);
});

it('envBool', () => {
    expect(envBool('app_debug')).toBe(true);
    expect(envBool('app_name')).toBe(false);
});

it('envBool with default value', () => {
    expect(envBool('not_exist', false)).toBe(false);
    expect(envBool('not_exist', true)).toBe(true);
});

