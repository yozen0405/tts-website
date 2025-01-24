const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const expireTime = 10 * 60;

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

module.exports = {
    generateSignedUrl,
    isExpired,
};