"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, MoreHorizontal, User, BarChart, Globe, Clock, Loader2, Mic, Calendar, ChevronRight, FileAudio } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { UserProfile } from "@/components/user-profile";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [audios, setAudios] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchAudios();
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const fetchAudios = async () => {
    try {
      const res = await fetch("/api/audios");
      const data = await res.json();
      if (data.audios) setAudios(data.audios);
    } catch (error) {
      console.error("Failed to fetch audios:", error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setTitle("");
        setFile(null);
        await fetchAudios();
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Soft shadow, no border */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold text-xl text-slate-800 tracking-tight transition-opacity hover:opacity-80">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-blue-600/20 shadow-lg">
              <Mic className="w-5 h-5 text-white" />
            </div>
            AudioTranscribe
          </Link>
          <UserProfile />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <div className="mb-12 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Workspace</h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Upload your audio files, and we&apos;ll convert them to highly accurate text transcripts using Google Vertex AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column - Upload Form */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800">New Transcription</h2>
                <p className="text-sm text-slate-500 mt-1">Upload an MP3, WAV, or M4A file</p>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Recording Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Marketing Team Sync"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-slate-50 border-none shadow-inner h-12 px-4 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 text-slate-700"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Audio File</Label>
                  <div 
                    className={`relative overflow-hidden rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                      file 
                        ? 'bg-blue-50' 
                        : 'bg-slate-50 hover:bg-slate-100/80'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {/* Soft dashed outline overlay using SVG to avoid harsh CSS borders */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="none" rx="16" stroke={file ? "#3b82f6" : "#cbd5e1"} strokeWidth="2" strokeDasharray="8 8" strokeOpacity={file ? "0.4" : "0.6"} />
                    </svg>

                    <input
                      id="file"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-2">
                          <FileAudio className="w-8 h-8" />
                        </div>
                        <span className="font-semibold text-slate-800 truncate max-w-[220px]">{file.name}</span>
                        <span className="text-sm text-blue-600/80 font-medium">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="mt-3 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          Remove file
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="bg-white shadow-sm p-4 rounded-full text-slate-400 mb-2">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <span className="font-semibold text-slate-700">Click to browse</span>
                        <span className="text-sm text-slate-500">Maximum size: 50MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUploading || !file || !title} 
                  className="w-full h-14 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Processing Audio...
                    </>
                  ) : (
                    "Transcribe Audio"
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column - Recent Audios */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Recordings</h2>
              <Badge variant="secondary" className="bg-white text-slate-600 shadow-sm border-0 font-semibold px-3 py-1 text-sm rounded-lg">
                {audios.length} {audios.length === 1 ? 'file' : 'files'}
              </Badge>
            </div>
            
            {audios.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileAudio className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-2">No recordings yet</h3>
                <p className="text-slate-500">
                  Upload your first audio file using the form on the left to see the transcriptions appear here.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[700px] pr-4 -mr-4">
                <div className="flex flex-col gap-4 pb-10">
                  {audios.map((audio) => (
                    <Link 
                      key={audio.id} 
                      href={`/audio/${audio.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 border border-transparent"
                    >
                      <div className="flex items-start gap-5 mb-4 sm:mb-0">
                        <div className="bg-slate-50 p-4 rounded-2xl shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-400 transition-colors">
                          <Mic className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {audio.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {new Date(audio.createdAt).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {new Date(audio.createdAt).toLocaleTimeString(undefined, {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        {audio.transcript ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-0 font-semibold px-3 py-1 rounded-lg">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-0 font-semibold px-3 py-1 rounded-lg">
                            Processing
                          </Badge>
                        )}
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-colors hidden sm:flex">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
