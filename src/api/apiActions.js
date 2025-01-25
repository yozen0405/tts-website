import { post } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

export async function uploadAudio(text, language, voice, speed, pitch) {
    try {
        const user = await getCurrentUser();

        const restOperation = post({
            apiName: "ttsHandler", 
            path: "/upload", 
            options: {
                body: { 
                    userId: user.userId, 
                    text,
                    language,
                    voice,
                    speed,
                    pitch
                },
                headers: {
                    "Content-Type": "application/json",
                },
            },
        });
        
        const { body } = await restOperation.response;
        const response = await body.json();
        
        // console.log("Upload Success:", response);
        return response.record; 
    } catch (error) {
        console.error("Error uploading audio:", error);
        throw error;
    }  
};

export async function getAudioHistory() {
    try {
        const user = await getCurrentUser();

        const restOperation = post({
            apiName: "ttsHandler", 
            path: "/getAudioHistory", 
            options: {
                body: { userId: user.userId },
                headers: {
                    "Content-Type": "application/json",
                },
            },
        });
        
        const { body } = await restOperation.response;
        const response = await body.json();

        // console.log("Audio History:", response);
        return response.records;
    } catch (error) {   
        console.error("Error fetching audio history:", error);
        throw error;
    }
}


export async function downloadAudio(createdAt) {
    try {
        const user = await getCurrentUser();
        const restOperation = post({
            apiName: "ttsHandler", 
            path: "/downloadAudio", 
            options: {
                body: { 
                    userId: user.userId,
                    createdAt 
                },
                headers: {
                    "Content-Type": "application/json",
                },
            },
        });
        
        const { body } = await restOperation.response;
        const response = await body.json();

        // console.log("Download Success:", response);
        return response.audio;
    } catch (error) {
        console.error("Error downloading audio:", error);
        throw error;
    }
};


export async function deleteAudioHistory(createdAt) {
    try {
        const user = await getCurrentUser();
        const restOperation = post({
            apiName: "ttsHandler", 
            path: "/deleteAudioHistory", 
            options: {
                body: { 
                    userId: user.userId,
                    createdAt 
                },
                headers: {
                    "Content-Type": "application/json",
                },
            },
        });
        
        const { body } = await restOperation.response;
        const response = await body.json();

        return response;
    } catch (error) {
        console.error("Error downloading audio:", error);
        throw error;
    }
};