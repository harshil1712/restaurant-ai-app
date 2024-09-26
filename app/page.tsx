"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { IconProps } from "@radix-ui/react-icons/dist/types";
import Button from "../components/Button";

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

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-3xl p-6 md:p-8 lg:p-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 md:p-8 lg:p-10">
            <h1 className="text-2xl font-bold mb-4 dark:text-gray-200">
              Upload the menu
            </h1>
            <form>
              <div className="flex justify-center items-center h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6">
                <label
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  htmlFor="image-upload"
                >
                  <UploadIcon className="w-8 h-8" />
                  <span>Drag and drop or click to upload</span>
                </label>
                <input
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>

              {preview && (
                <div className="bg-white dark:bg-gray-800 shadow-md mt-4 mb-4">
                  <img
                    src={preview}
                    alt="Uploaded Image"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}
              <div className="flex justify-between">
                <Button text="Upload" submitHandler={handleWorkerApiSubmit} />
              </div>
            </form>
            <div className="mt-2">
              <p className="text-gray-200 dark:text-gray-500">{message}</p>
            </div>
          </div>
          <div className="text-white">
            <p>{aiResult}</p>
          </div>
        </div>
      </div>
    </main>
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
