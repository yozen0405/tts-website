/* Amplify Params - DO NOT EDIT
    AUTH_TTS3C1965C7_USERPOOLID
    ENV
    REGION
    STORAGE_S35377B734_BUCKETNAME
    STORAGE_TTSAUDIODETAIL_ARN
    STORAGE_TTSAUDIODETAIL_NAME
    STORAGE_TTSAUDIODETAIL_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { userId, createdAt } = JSON.parse(event.body);

        if (!userId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Unauthorized. userId is missing." }),
            };
        }

        if (!createdAt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid input. createdAt is required." }),
            };
        }

        // Step 3: 查詢 DynamoDB，檢索該音檔的元數據
        const tableName = process.env.STORAGE_TTSAUDIODETAIL_NAME; // DynamoDB 表名稱
        const getParams = {
            TableName: tableName,
            Key: {
                userId: userId,
                createdAt: createdAt,
            },
        };

        const result = await dynamoDB.get(getParams).promise();

        // 如果找不到該記錄或 User ID 不匹配
        if (!result.Item || result.Item.userId !== userId) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Record not found or access denied." }),
            };
        }

        const record = result.Item;

        // Step 4: 獲取文件的二進制數據
        const bucketName = process.env.STORAGE_S35377B734_BUCKETNAME;
        const filePath = record.filePath;

        const file = await s3
            .getObject({
                Bucket: bucketName,
                Key: filePath,
            })
            .promise();

        // 返回二進制文件
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({
                audio: file.Body.toString("base64"),
            }),
        };
    } catch (error) {
        console.error("Error:", error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};