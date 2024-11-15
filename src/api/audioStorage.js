import { uploadData, getUrl, remove, downloadData } from '@aws-amplify/storage';

export async function uploadAudio(audioBlob) {
  const audioFile = new File([audioBlob], `audio_${Date.now()}.mp3`, { type: 'audio/mpeg' });
  const s3Key = await uploadData({
    path: ({ identityId }) => `private/${identityId}/audio/${audioFile.name}`,
    data: audioFile,
    options: {
      level: 'private',
      contentType: 'audio/mpeg',
    },
  }).result;
  return s3Key.path;
}

export async function getAudioUrl(path) {
  const urlData = await getUrl({
    path: path,
  });
  return urlData.url.href;
}

export async function deleteAudio(path) {
  await remove({ path });
}

export async function downloadAudio(path) {
  const s3Key = await downloadData({
    path: path
  });
  return s3Key.result;
}

export async function createAudioUrl(path) {
  const s3Key = await downloadData({
    path: path
  }).result;
  if (s3Key?.body) {
    // 生成 Blob
    const blob = s3Key.body;
    // 創建一個 Object URL
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl; // 返回 URL 供播放
  }

  throw new Error('音頻下載失敗');
}