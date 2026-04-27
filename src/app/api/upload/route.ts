import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { vertex } from "@ai-sdk/google-vertex";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let transcript = "";

    try {
      const prompt = `You are a helpful assistant that transcribes voice and video messages. If audio does not contain any speech say: '_Audio does not contain any speech_'. Apply line breaks when necessary. For paragraphs, use double line breaks.`;
      const result = await generateText({
        model: vertex("gemini-2.5-flash"),
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe the audio",
              },
              {
                type: "file",
                data: buffer,
                mediaType: file.type || "audio/mpeg",
              },
            ],
          },
        ],
      });

      transcript = result.text;
    } catch (aiError) {
      console.error("AI Transcription Error:", aiError);
      transcript = "Error: Failed to process transcription.";
    }

    const newAudio = await prisma.audio.create({
      data: {
        title,
        transcript,
        fileName: null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, audio: newAudio });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
