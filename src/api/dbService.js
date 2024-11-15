import { createAudioHistory, deleteAudioHistory } from '../graphql/mutations';
import { getAudioHistory, listAudioHistories } from '../graphql/queries';
import { generateClient } from 'aws-amplify/api';
import { deleteAudio, getAudioUrl } from './audioStorage';
import { updateAudioHistory } from '../graphql/mutations';

const client = generateClient();

export async function getAudioById(id) {
    try {
        const response = await client.graphql({
            query: getAudioHistory,
            variables: { id },
        });

        if (response.data.getAudioHistory) {
            const record = await updateAudioRecord(response.data.getAudioHistory);
            return record;
        } else {
            throw new Error('Audio record not found');
        }
    } catch (error) {
        console.error('Error fetching audio by ID:', error);
        throw error; 
    }
}

export async function getAudioPathById(id) {
    try {
        const response = await client.graphql({
            query: getAudioHistory,
            variables: { id },
        });

        if (response.data.getAudioHistory) {
            const record = response.data.getAudioHistory;
            return record;
        } else {
            throw new Error('Audio record not found');
        }
    } catch (error) {
        console.error('Error fetching audio by ID:', error);
        throw error; 
    }
}

export async function getAudioByUid(userId) {
    const { data } = await client.graphql({
        query: listAudioHistories,
        variables: {
          filter: { userId: { eq: userId } },
        },
    });
    return data.listAudioHistories.items || [];
}

export async function getSortedAudio(records) {
    const MAX_CHARS = process.env.REACT_APP_MAX_AUDIO_TEXT_CHARS;
    const sortedRecordsWithUrls = await Promise.all(
        records
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
            .map(async (record) => {
                const url = await updateAudioUrl(record);
                return {
                    ...record,
                    url,
                    createdAt: new Date(record.createdAt).toLocaleString(), 
                    shortText: record.text.length > MAX_CHARS ? `${record.text.slice(0, MAX_CHARS)}...` : record.text,
                };
            })
    );
    return sortedRecordsWithUrls;
}


export async function removeOldestAudio(audioRecords) {
    const oldestRecord = audioRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

    // Delete the oldest record from DynamoDB and S3
    await client.graphql({
        query: deleteAudioHistory, // Define this mutation in your schema if not already defined
        variables: { input: { id: oldestRecord.id } },
    });

    await deleteAudio(oldestRecord.audioPath);
}

export async function saveNewAudio(userId, text, url, path) {
    const response = await client.graphql({
        query: createAudioHistory,
        variables: {
            input: {
                userId: userId,
                text: text,
                audioUrl: url,
                audioPath: path
            },
        },
    });
    const record = response.data.createAudioHistory;
    return record;
}

export async function updateAudioUrl(record) {
    const isExpired = (updatedTime) => {
        const expirationTime = 15 * 60 * 1000;
        const updatedDate = new Date(updatedTime);
        return new Date() - updatedDate > expirationTime;
    };

    let updatedTime = record.updatedAt;
    let url = record.audioUrl;

    if (isExpired(updatedTime)) {
        url = await getAudioUrl(record.audioPath);
        await client.graphql({
            query: updateAudioHistory,
            variables: {
                input: {
                    id: record.id,
                    audioUrl: url,
                },
            },
        });
    }
    return url;
}

export async function updateAudioRecord(record) {
    const isExpired = (updatedTime) => {
        const expirationTime = 15 * 60 * 1000; // 15 minutes
        const updatedDate = new Date(updatedTime);
        return new Date() - updatedDate > expirationTime;
    };

    if (isExpired(record.updatedAt)) {
        console.log("update expired", record);
        const newUrl = await getAudioUrl(record.audioPath);
        const response = await client.graphql({
            query: updateAudioHistory,
            variables: {
                input: {
                    id: record.id,
                    audioUrl: newUrl,
                },
            },
        });
        return response.data.updateAudioHistory;
    }
    return record; 
}
