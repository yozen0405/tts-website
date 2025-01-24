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
const { generateSignedUrl, isExpired } = require("/opt/nodejs/utils");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        // Step 1: 獲取 Cognito User ID
        const { userId } = JSON.parse(event.body);

        if (!userId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Unauthorized. userId is missing." }),
            };
        }

        // Step 2: 查詢用戶的所有音檔記錄
        const tableName = process.env.STORAGE_TTSAUDIODETAIL_NAME; // DynamoDB 表名稱
        const queryParams = {
            TableName: tableName,
            IndexName: "userId-index", // 假設你已經創建了 Global Secondary Index (GSI) 基於 userId
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
          	ScanIndexForward: false,
        };

        const result = await dynamoDB.query(queryParams).promise();
        const records = result.Items;

        if (!records || records.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No audio records found for this user." }),
            };
        }

        // Step 3: 檢查每個記錄的 URL 是否過期，並在需要時更新
        const now = new Date();

        const updatedRecords = await Promise.all(
            records.map(async (record) => {
                const updatedAt = new Date(record.updatedAt);

                if (isExpired(updatedAt)) {
                    // 如果過期，生成新的簽名 URL
                    const bucketName = process.env.STORAGE_S35377B734_BUCKETNAME;
                    const filePath = record.filePath;

                    const newUrl = generateSignedUrl(bucketName, filePath);

                    // 更新記錄的 URL 和 updatedAt
                    const updateParams = {
                        TableName: tableName,
                        Key: { userId: record.userId, createdAt: record.createdAt }, // 必須匹配主鍵結構
                        UpdateExpression: "set #url = :url, updatedAt = :updatedAt",
                        ExpressionAttributeNames: { "#url": "url" },
                        ExpressionAttributeValues: {
                            ":url": newUrl,
                            ":updatedAt": now.toISOString(),
                        },
                        ReturnValues: "ALL_NEW",
                    };

                    const updatedRecord = await dynamoDB.update(updateParams).promise();
                    return updatedRecord.Attributes;
                } else {
                    // 如果未過期，直接返回現有的記錄
                    return record;
                }
            })
        );

        // Step 4: 返回成功響應
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            body: JSON.stringify({
                message: "User audio history retrieved successfully.",
                records: updatedRecords,
            }),
        };
    } catch (error) {
        console.error("Error:", error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};