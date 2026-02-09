import { NextResponse } from 'next/server';
import { geminiModel } from '@/utils/ai';

export async function GET() {
    try {
        const prompt = "Say 'Gemini is connected and working!' if you can read this.";
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            success: true,
            message: text,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('AI Test Route Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
