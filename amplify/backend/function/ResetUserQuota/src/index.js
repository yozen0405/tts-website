/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_TTSUSERTABLE_ARN
	STORAGE_TTSUSERTABLE_NAME
	STORAGE_TTSUSERTABLE_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.STORAGE_TTSUSERTABLE_NAME;

exports.handler = async (event) => {
    try {
        console.log("Starting monthly quota reset...");

        // 扫描 DynamoDB 表，获取所有用户数据
        const params = {
            TableName: tableName,
        };

        const data = await dynamoDB.scan(params).promise();

        const resetPromises = data.Items.map(async (user) => {
            const updateParams = {
                TableName: tableName,
                Key: { userId: user.userId },
                UpdateExpression: "SET quotaUsed = :reset",
                ExpressionAttributeValues: {
                    ":reset": 0,
                },
            };

            return dynamoDB.update(updateParams).promise();
        });

        // 等待所有用户更新完成
        await Promise.all(resetPromises);

        console.log("Monthly quota reset completed successfully.");
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ message: "Monthly quota reset completed successfully." }),
        };
    } catch (error) {
        console.error("Error resetting quotas:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ message: "Error resetting quotas.", error: error.message }),
        };
    }
};