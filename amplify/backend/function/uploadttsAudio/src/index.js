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
const axios = require('axios'); 
const { generateSignedUrl } = require("/opt/nodejs/utils");
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        // Step 2: 解析請求中的文字
        const { userId, text, language, voice, speed, pitch } = JSON.parse(event.body);

        if (!userId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Unauthorized. userId is missing.' }),
            };
        }
        if (!text || !language || !voice || !speed || !pitch) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid input. Text is required.' }),
            };
        }

        await checkAndRemoveOldRecords(userId);

        // Step 3: 向 Azure Speech Service 請求 TTS
        const audioBuffer = await getAudioFromAzure(text, language, voice, speed, pitch);

        // Step 4: 將音檔上傳到 S3
        const bucketName = process.env.STORAGE_S35377B734_BUCKETNAME; // S3 Bucket 環境變數
        const filePath = `private/${userId}/${Date.now()}.mp3`; // 生成唯一的音檔路徑
        await s3
            .upload({
                Bucket: bucketName,
                Key: filePath,
                Body: audioBuffer,
                ContentType: 'audio/mpeg',
            })
            .promise();

        // Step 5: 生成 S3 預簽名 URL
        const url = generateSignedUrl(bucketName, filePath);

        // Step 6: 保存元數據到 DynamoDB
        const tableName = process.env.STORAGE_TTSAUDIODETAIL_NAME; // DynamoDB 表名稱
        const metadata = {
            userId: userId,
            filePath,
            url,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            description: text,
        };
        await dynamoDB
            .put({
                TableName: tableName,
                Item: metadata,
            })
            .promise();

        // Step 7: 返回成功響應
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                message: 'Audio uploaded successfully',
                record: metadata,
            }),
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};

// 檢查並刪除最舊的記錄（如果超過 10 筆）
const checkAndRemoveOldRecords = async (userId) => {
    const tableName = process.env.STORAGE_TTSAUDIODETAIL_NAME;

    // 查詢該使用者的所有記錄，按 createdAt 升序排序
    const queryParams = {
        TableName: tableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId,
        },
        ScanIndexForward: true, // 升序排序（最舊的在前）
    };

    const result = await dynamoDB.query(queryParams).promise();

    // 如果記錄數量超過 10，刪除最舊的一筆
    if (result.Items.length >= 10) {
        const oldestRecord = result.Items[0]; // 最舊的一筆

        const deleteParams = {
            TableName: tableName,
            Key: {
                userId: oldestRecord.userId,
                createdAt: oldestRecord.createdAt,
            },
        };

        await dynamoDB.delete(deleteParams).promise();
        console.log(`Deleted oldest record: ${JSON.stringify(oldestRecord)}`);
    }
};


// 從 Azure Speech Service 獲取音檔
const getAudioFromAzure = async (text, language, voice, speed, pitch) => {
    try {
        const azureRegion = process.env.AZURE_REGION; 
        const azureSubscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;

        // Azure Speech Service 的 TTS API URL
        const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

        // TTS 請求的 Header
        const headers = {
            'Ocp-Apim-Subscription-Key': azureSubscriptionKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
        };

        // 構造 SSML 請求內容
        const ssml = `
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
                <voice name="${voice}">
                    <prosody rate="${speed}" pitch="${pitch}">
                        ${text}
                    </prosody>
                </voice>
            </speak>
        `;

        // 發送請求到 Azure Speech Service
        const response = await axios.post(url, ssml, { headers, responseType: 'arraybuffer' });

        // 返回音檔的二進制數據
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Error fetching audio from Azure:', error.message);
        throw new Error(`Failed to fetch audio from Azure, ${error.message}`);
    }
};