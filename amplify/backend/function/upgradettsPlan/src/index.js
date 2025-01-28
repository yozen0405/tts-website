/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_TTSUSERTABLE_ARN
	STORAGE_TTSUSERTABLE_NAME
	STORAGE_TTSUSERTABLE_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const { getUsagePlan } = require("/opt/nodejs/utils");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.STORAGE_TTSUSERTABLE_NAME;

exports.handler = async (event) => {
    try {
        const { userId } = JSON.parse(event.body);

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid input. userId is required.' }),
            };
        }

        // Step 1: 提取使用者當前計畫
        const params = {
            TableName: tableName,
            Key: { userId },
        };

        const result = await dynamoDB.get(params).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found.' }),
            };
        }

        const currentPlan = result.Item.plan;

        // Step 2: 獲取升級後的使用計畫
        const newUsagePlan = getUsagePlan(currentPlan);

        if (!newUsagePlan || newUsagePlan.plan === currentPlan) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No upgrade available or already at the highest plan.' }),
            };
        }

        // Step 3: 更新新的使用計畫到 DynamoDB
        const updateParams = {
            TableName: tableName,
            Key: { userId },
            UpdateExpression:
                "set #plan = :plan, quotaLimit = :quotaLimit, charLimit = :charLimit",
            ExpressionAttributeNames: {
                "#plan": "plan",
            },
            ExpressionAttributeValues: {
                ":plan": newUsagePlan.plan,
                ":quotaLimit": newUsagePlan.quotaLimit,
                ":charLimit": newUsagePlan.charLimit,
            },
        };

        await dynamoDB.update(updateParams).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                message: 'Plan upgraded successfully.',
                newPlan: newUsagePlan,
            }),
        };
    } catch (error) {
        console.error('Error upgrading user plan:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                message: 'Error upgrading user plan.',
                error: error.message,
            }),
        };
    }
};