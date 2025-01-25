/* Amplify Params - DO NOT EDIT
	AUTH_TTS3C1965C7_USERPOOLID
	ENV
	REGION
	STORAGE_S35377B734_BUCKETNAME
	STORAGE_TTSAUDIODETAIL_ARN
	STORAGE_TTSAUDIODETAIL_NAME
	STORAGE_TTSAUDIODETAIL_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        // 解析請求參數
        const { userId, createdAt } = JSON.parse(event.body);

        if (!userId || !createdAt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid input. userId and createdAt are required.' }),
            };
        }

        const tableName = process.env.STORAGE_TTSAUDIODETAIL_NAME; // DynamoDB 表名稱

        // 刪除指定的記錄
        const deleteParams = {
            TableName: tableName,
            Key: {
                userId: userId,
                createdAt: createdAt,
            },
        };

        await dynamoDB.delete(deleteParams).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ message: 'Record deleted successfully.' }),
        };
    } catch (error) {
        console.error('Error deleting record:', error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};

