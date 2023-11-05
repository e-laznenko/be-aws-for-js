module.exports.handler = async (event, context, callback) => {
    console.log('event.authorizationToken', event.authorizationToken);
    if (!event.authorizationToken) {
        return callback('Unauthorized');
    }


    const encodedCreds = event.authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');

    const [login, password] = plainCreds;

    if (process.env[login] === password) {
        const policyDocument = {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event.methodArn,
                },
            ],
        };

        return callback(null, {
            principalId: login,
            policyDocument,
        });
    } else {
        return callback('Forbidden');
    }
};