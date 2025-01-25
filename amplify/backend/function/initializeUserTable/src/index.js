/* Amplify Params - DO NOT EDIT
	AUTH_TTS3C1965C7_USERPOOLID
	ENV
	REGION
	STORAGE_TTSUSERTABLE_ARN
	STORAGE_TTSUSERTABLE_NAME
	STORAGE_TTSUSERTABLE_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const { getUsagePlan } = require("/opt/nodejs/utils"); 
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

const userPoolId = process.env.AUTH_TTS3C1965C7_USERPOOLID;
const tableName = process.env.STORAGE_TTSUSERTABLE_NAME; 

exports.handler = async () => {
    try {
        let users = [];
        let nextToken = null;

        do {
            const params = {
                UserPoolId: userPoolId,
                Limit: 60,
                PaginationToken: nextToken,
            };

            const response = await cognitoIdentityServiceProvider.listUsers(params).promise();
            users = users.concat(response.Users);
            nextToken = response.PaginationToken;
        } while (nextToken);

        const promises = users.map(async (user) => {
            const userId = user.Attributes.find((attr) => attr.Name === 'sub').Value;
            const usagePlan = getUsagePlan();

            // 初始化資料
            const newUserQuota = {
                userId,
                plan: usagePlan.plan,
                quotaLimit: usagePlan.quotaLimit,
                charLimit: usagePlan.charLimit,
                quotaUsed: 0,
                createdAt: new Date().toISOString(),
            };

            // 將資料寫入 DynamoDB
            return dynamoDB
                .put({
                    TableName: tableName,
                    Item: newUserQuota,
                    ConditionExpression: 'attribute_not_exists(userId)', // 防止重複初始化
                })
                .promise();
        });

        await Promise.all(promises);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'All users initialized successfully.' }),
        };
    } catch (error) {
        console.error('Error initializing users:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error initializing users.', error: error.message }),
        };
    }
};