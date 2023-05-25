const {
    check,
    reduce,
    filter,
    get
} = require('../../../mod/utils/roles');

describe('Module', () => {
    describe('check', () => {
        test('should return the object if roles match', () => {
            const obj = {
                roles: {
                    role1: true,
                    role2: true
                }
            };
            const roles = ['role1', 'role2'];

            const result = check(obj, roles);

            expect(result).toBe(obj);
        });

        test('should return false if negated role is matched', () => {
            const obj = {
                roles: {
                    '!role1': true,
                    role2: true
                }
            };
            const roles = ['role1', 'role2'];

            const result = check(obj, roles);

            expect(result).toBe(false);
        });

        test('should return false if every role is negated', () => {
            const obj = {
                roles: {
                    '!role1': true,
                    '!role2': true
                }
            };
            const roles = ['role1', 'role2'];

            const result = check(obj, roles);

            expect(result).toBe(false);
        });

        test('should return false if no roles match', () => {
            const obj = {
                roles: {
                    role1: true,
                    role2: true
                }
            };
            const roles = ['role3'];

            const result = check(obj, roles);

            expect(result).toBe(false);
        });
    });

    describe('reduce', () => {
        test('should reduce the object based on roles', async () => {
            const obj = {
                key1: 'value1',
                key2: {
                    key3: 'value2',
                    roles: {
                        'role1': true,
                        '!role2': true
                    }
                },
                key4: {
                    key5: 'value3',
                    roles: {
                        '!role1': true,
                        'role2': true
                    }
                }
            };
            const roles = ['role2'];

            await reduce(obj, roles);

            expect(obj).toEqual({
                key1: 'value1',
                key4: {
                    key5: 'value3',
                    roles: {
                        '!role1': true,
                        role2: true
                    }
                }
            });
        });
    });

    describe('filter', () => {
        // test('should filter the object based on roles', () => {
        //     const obj = {
        //         key1: 'value1',
        //         key2: {
        //             key3: 'value2',
        //             roles: {
        //                 role1: true,
        //                 '!role2': true,
        //                 role3: false
        //             }
        //         },
        //         key4: {
        //             key5: 'value3',
        //             roles: {
        //                 '!role1': true,
        //                 role2: true,
        //                 role4: true
        //             }
        //         }
        //     };


        //     console.log(!obj.roles);

        //     const roles = ['role2', 'role4'];

        //     const result = filter(obj, roles);

        //     console.log(result);

        //     expect(result).toEqual({
        //         '!role1': true,
        //         role2: true,
        //         role4: true
        //     });
        // });

        test('should return undefined if obj.roles is not defined', () => {
            const obj = {
                key1: 'value1',
                key2: 'value2'
            };
            const roles = ['role1'];

            const result = filter(obj, roles);

            expect(result).toBeUndefined();
        });

        test('should return an array of unique roles', () => {
            const obj = {
                key1: 'value1',
                key2: {
                    key3: 'value2',
                    roles: {
                        role1: true,
                        '!role2': true,
                        role3: false
                    }
                },
                key4: {
                    key5: 'value3',
                    roles: {
                        '!role1': true,
                        role2: true,
                        role4: true
                    }
                }
            };

            const result = get(obj);

            expect(result).toEqual(['role1', 'role2', 'role3', 'role4']);
        });

        test('should return an empty array if no roles are found', () => {
            const obj = {
                key1: 'value1',
                key2: 'value2'
            };

            const result = get(obj);

            expect(result).toEqual([]);
        });
    });
});