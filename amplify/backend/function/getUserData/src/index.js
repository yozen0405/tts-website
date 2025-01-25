/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_TTSUSERTABLE_ARN
	STORAGE_TTSUSERTABLE_NAME
	STORAGE_TTSUSERTABLE_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.STORAGE_TTSUSERTABLE_NAME;

exports.handler = async (event) => {
    try {
        const { userId } = JSON.parse(event.body);

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing userId in request body." }),
            };
        }

        const params = {
            TableName: tableName,
            Key: {
                userId: userId, // 主鍵
            },
        };

        console.log(`Fetching data for userId: ${userId}`);

        const result = await dynamoDB.get(params).promise();

        // 檢查是否找到資料
        if (!result.Item) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify({ message: `User with userId ${userId} not found.` }),
            };
        }

        // 成功返回用戶資料
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        console.error("Error fetching user data:", error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message,
            }),
        };
    }
};