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
        const tableName = process.env.STORAGE_TTSAUDIODETAIL_NAME;
        const queryParams = {
            TableName: tableName,
            IndexName: "userId-index", 
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
          	ScanIndexForward: false,
        };

        console.time("DynamoDB Query Time");
        const result = await dynamoDB.query(queryParams).promise();
        console.timeEnd("DynamoDB Query Time");
        const records = result.Items || [];

        // Step 3: 檢查是否有任何記錄過期
        const now = new Date();
        let hasExpired = false;

        for (const record of records) {
            if (isExpired(new Date(record.updatedAt))) {
                hasExpired = true;
                break; 
            }
        }

        // Step 4: 如果有過期的，就重新生成所有記錄的 URL
        let updatedRecords = [...records];
        if (hasExpired) {
            console.time("Regenerate all URLs");

            const bucketName = process.env.STORAGE_S35377B734_BUCKETNAME;
            updatedRecords = records.map(record => ({
                ...record,
                url: generateSignedUrl(bucketName, record.filePath),
                updatedAt: now.toISOString(),
            }));

            console.timeEnd("Regenerate all URLs");

            // Step 5: 批量更新 DynamoDB
            console.time("Batch update time");
            const batchWriteParams = {
                RequestItems: {
                    [tableName]: updatedRecords.map((record) => ({
                        PutRequest: { Item: record },
                    })),
                },
            };

            await dynamoDB.batchWrite(batchWriteParams).promise();
            console.timeEnd("Batch update time");
        }

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