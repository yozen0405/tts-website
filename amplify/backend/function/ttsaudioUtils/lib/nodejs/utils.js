const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const expireTime = 2 * 60; // 3 小時（秒）

/**
 * 生成 S3 預簽名 URL
 * @param {string} bucketName S3 存儲桶名稱
 * @param {string} filePath 文件路徑
 * @returns {string} 預簽名 URL
 */
const generateSignedUrl = (bucketName, filePath) => {
    const params = {
        Bucket: bucketName,
        Key: filePath,
        Expires: expireTime,
    };
    return s3.getSignedUrl("getObject", params);
};

/**
 * 檢查時間是否過期
 * @param {Date} updatedAt 上次更新時間
 * @returns {boolean} 是否已過期
 */
const isExpired = (updatedAt) => {
    const now = new Date();
    return now - new Date(updatedAt) >= expireTime;
};

const usagePlans = [
    { plan: "free", quotaLimit: 1000, charLimit: 50 },
    { plan: "premium", quotaLimit: 10000, charLimit: 800 },
    { plan: "enterprise", quotaLimit: 50000, charLimit: 2000 },
];

/**
 * 獲取用戶的升級使用計劃
 * @param {Object} param 包含用戶級別的參數 
 * @returns {Object} 包含計劃名稱 (plan) 和對應的配額 (quota)
 */
const getUsagePlan = (param) => {
    const planMap = new Map(usagePlans.map((plan, index) => [plan.plan, index]));

    if (param && planMap.has(param)) {
        const currentIndex = planMap.get(param);
        const nextIndex = Math.min(currentIndex + 1, usagePlans.length - 1); 
        return usagePlans[nextIndex]; 
    }

    // 默認返回 free 計劃
    return usagePlans[0];
};

module.exports = {
    generateSignedUrl,
    isExpired,
    getUsagePlan
};