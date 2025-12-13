import OpenAI from 'openai';

// Supported formats for Nvidia VLM
const kSupportedList: Record<string, string[]> = {
    "png": ["image/png", "image_url"],
    "jpg": ["image/jpeg", "image_url"],
    "jpeg": ["image/jpeg", "image_url"],
    "webp": ["image/webp", "image_url"],
    "mp4": ["video/mp4", "video_url"],
    "webm": ["video/webm", "video_url"],
    "mov": ["video/mov", "video_url"]
};

function getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

function mimeType(ext: string): string {
    return kSupportedList[ext]?.[0] || '';
}

function mediaType(ext: string): string {
    return kSupportedList[ext]?.[1] || '';
}

// Convert File to Base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the Data URL prefix (e.g., "data:video/mp4;base64,") to get just the base64 string
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

export const analyzeVideoWithNvidia = async (
    prompt: string,
    videoFile: File
): Promise<string> => {
    try {
        const apiKey = process.env.NVIDIA_API_KEY;

        // DEBUG: Check if key is loaded
        console.log("DEBUG: Nvidia API Key Status:", {
            exists: !!apiKey,
            length: apiKey?.length || 0,
            isPlaceholder: apiKey?.includes("NVIDIA_API_KEY"),
            firstChar: apiKey ? apiKey[0] : 'N/A'
        });

        if (!apiKey || apiKey.includes("NVIDIA_API_KEY")) {
            console.error("Nvidia API Key missing");
            return "Error: Nvidia API Configuration missing. Please check your .env file and restart the server.";
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://integrate.api.nvidia.com/v1',
            dangerouslyAllowBrowser: true // Required for client-side usage
        });

        const ext = getExtension(videoFile.name);
        if (!kSupportedList[ext]) {
            return `Error: Unsupported file format .${ext}`;
        }

        const mediaTypeKey = mediaType(ext);
        const base64Data = await fileToBase64(videoFile);

        // Construct content array
        const content = [
            { type: "text" as const, text: prompt },
            {
                type: mediaTypeKey as "image_url" | "video_url",
                [mediaTypeKey]: {
                    url: `data:${mimeType(ext)};base64,${base64Data}`
                }
            }
        ];

        const response = await openai.chat.completions.create({
            model: "nvidia/nemotron-nano-12b-v2-vl",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant analyzing security footage."
                },
                {
                    role: "user",
                    content: content as any // OpenAI Types might be strict about custom shapes, casting for safety
                }
            ],
            temperature: 0.2,
            max_tokens: 1024,
            stream: false
        });

        return response.choices[0]?.message?.content || "No response generated.";

    } catch (error) {
        console.error("Nvidia API Error:", error);
        return "An error occurred during Nvidia analysis.";
    }
};
