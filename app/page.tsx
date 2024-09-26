"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { IconProps } from "@radix-ui/react-icons/dist/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ReactMarkdown from "react-markdown";

type MenuItem = {
  name: string;
  ingredients: string[];
  isVegetarian: boolean;
};

export default function Home() {
  const [file, setFile] = useState<File | undefined>();
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const uploadedFile = event.target.files?.[0];
      setFile(uploadedFile);
      let reader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    }
    setMessage("");
  };

  const handleWorkerApiSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file) {
      setUploading(true);
      setMessage("Uploading...");
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`/api/ai`, {
          method: "POST",
          body: formData,
        });

        if (res.status !== 200) {
          setMessage("File Upload Failed");
        }

        const result = await res.json();
        // @ts-ignore
        setAiResult(result.response);
        setMessage("File Upload Successful");
      } catch (error) {
        setMessage("An error occured");
      } finally {
        setUploading(false);
      }
    } else {
      setMessage("Please select a file");
    }
  };

  const parseMenuItems = (content: string): MenuItem[] => {
    const items = content.split("\n\n");
    return items.map((item) => {
      const [name, ingredientsStr, vegetarianStr] = item.split("\n");
      return {
        name,
        ingredients: ingredientsStr.replace("Ingredients: ", "").split(", "),
        isVegetarian: vegetarianStr.includes("Vegetarian: Yes"),
      };
    });
  };
  // const menuItems = aiResult ? parseMenuItems(aiResult) : [];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <CardHeader className="p-0">
            <CardTitle className="text-4xl font-bold flex items-center mb-2">
              <Utensils className="mr-2" />
              Menu Translator
            </CardTitle>
            <CardDescription className="text-white/80">
              Upload a menu image and get it translated to English with
              ingredient details
            </CardDescription>
          </CardHeader>
        </div>
        <CardContent className="p-6">
          <form>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative w-full">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  aria-label="Upload menu image"
                />
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> Choose Image
                </Button>
              </div>
              <Button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleWorkerApiSubmit(
                    e as unknown as FormEvent<HTMLFormElement>
                  );
                }}
                disabled={!preview || uploading}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  "Translate Menu"
                )}
              </Button>
            </div>
          </form>
          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Selected image preview:
              </p>
              <img
                src={preview}
                alt="Menu preview"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {aiResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-600">
                  Translated Menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReactMarkdown>{aiResult}</ReactMarkdown>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
