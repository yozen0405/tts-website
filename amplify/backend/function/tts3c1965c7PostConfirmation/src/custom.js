const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { getUsagePlan } = require("/opt/nodejs/utils"); 

const USER_TABLE = process.env.STORAGE_TTSUSERTABLE_NAME; 

exports.handler = async (event, context) => {
    console.log("Event:", JSON.stringify(event, null, 2));

    const userId = event.request.userAttributes.sub;

    if (!userId) {
        console.error("User ID is missing from the event");
        throw new Error("User ID is required");
    }

    try {
        const usagePlan = getUsagePlan();

        // 插入到 DynamoDB 的項目
        const item = {
            userId: userId,
            plan: usagePlan.plan,
            quotaUsed: 0, 
            quotaLimit: usagePlan.quotaLimit,
            charLimit: usagePlan.charLimit,
            createdAt: new Date().toISOString(),
        };

        // 將用戶數據插入到 DynamoDB
        await dynamoDB
            .put({
                TableName: USER_TABLE,
                Item: item,
            })
            .promise();

        console.log("User initialized with usage plan:", item);

        return event;
    } catch (error) {
        console.error("Error initializing user in DynamoDB:", error);
        throw new Error("Failed to initialize user in DynamoDB");
    }
};
