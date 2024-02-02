import OpenAI from 'openai';

export async function getDaySummary(csvContent: string) {
    const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `
                    You will be provided CSV file, that contains data from of operating system active windows. 
                    You should analyze that file. And give out useful facts and summaries.`,
                },
                { role: 'user', content: csvContent },
            ],
            model: 'gpt-3.5-turbo',
        });

        console.log('answer.....', completion.choices);
    } catch (error) {
        console.error('OpenAi error');
        console.error(error);
    }
}
