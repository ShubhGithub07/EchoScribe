"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileAudio } from "lucide-react";

export default function AudioTranscriber() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTranscript(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio");
      }

      setTranscript(data.transcript);
    } catch (err) {
      setError(`An error occurred: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileAudio className="mr-2" />
            Audio Transcription
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
                id="audio-file"
              />
              <label
                htmlFor="audio-file"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <Upload className="mr-2" />
                {file ? file.name : "Choose an audio file"}
              </label>
            </div>
            <Button
              type="submit"
              disabled={!file || isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Transcribing...
                </>
              ) : (
                "Transcribe Audio"
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {transcript && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3 text-indigo-800">Transcript:</h3>
              <p className="whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-200 shadow-inner">
                {transcript}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
