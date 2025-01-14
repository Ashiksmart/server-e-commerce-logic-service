'use strict';


module.exports = (server, options) => ({

    scheme: 'jwt',
    options: {
        keys: {
            key: options.jwtKey,
            algorithms: ['HS256']
        },
        verify: {
            aud: false,
            iss: false,
            sub: false
        },
        validate: async (decoded, request) => {
            try {
                if (decoded ) {
                    return  { isValid: true }
                }
                return { isValid: false };
            } catch (error) {
                console.log("error", error);
                return { isValid: false };
            }

        }
    }
});