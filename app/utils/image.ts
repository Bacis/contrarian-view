export const generateViewImage = async (prompt: string): Promise<string | undefined | null> => {
    try {
        const generationResponse = await fetch(
            "https://cloud.leonardo.ai/api/rest/v1/generations",
            {
                method: 'POST',
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    modelId: "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
                    contrast: 3.5,
                    prompt: prompt,
                    num_images: 4,
                    width: 1472,
                    height: 832,
                    alchemy: true,
                    styleUUID: "111dc692-d470-4eec-b791-3475abac4c46",
                    enhancePrompt: false,
                })
            }
        );

        const generationData = await generationResponse.json();

        if (generationData.sdGenerationJob) {
            const generationId =
                generationData.sdGenerationJob.generationId;

            console.log("Generation ID:", generationId);

            // Implement polling method with 7-second delay
            let statusResponse;
            let attempts = 0;
            const maxAttempts = 10; // Prevent infinite loop

            while (attempts < maxAttempts) {
                statusResponse = await fetch(
                    `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
                    {
                        headers: {
                            accept: "application/json",
                            authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
                        },
                    }
                );

                const statusData = await statusResponse.json();

                // Check if images are generated
                const generatedImages =
                    statusData.generations_by_pk
                        .generated_images;

                if (generatedImages && generatedImages.length > 0) {
                    console.log("Generated Images:", generatedImages);

                    // Return the first image URL
                    return generatedImages[0].url;
                }

                // Wait 7 seconds before next attempt
                await new Promise((resolve) =>
                    setTimeout(resolve, 7000)
                );
                attempts++;
                console.log(
                    "Waiting for 7 seconds before next attempt",
                    attempts
                );
            }

            if (attempts === maxAttempts) {
                console.warn(
                    "Max polling attempts reached without generating images"
                );
                return null;
            }
        } else {
            throw new Error("No generationId found");
        }
    } catch (error) {
        console.error("Leonardo AI Image Generation Error:", error);
        return null;
    }
}