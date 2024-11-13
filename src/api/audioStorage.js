import { uploadData, getUrl, remove } from '@aws-amplify/storage';

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