"use client";
import Link from "next/link";
import React, { useCallback, useRef, useState } from "react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { loggedInUserData } from "@/app/data";
import { Textarea } from "../ui/textarea";
import { EmojiPicker } from "../emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FileImage, Mic, Paperclip, PlusCircle, SendHorizontal, ThumbsUp } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { AudioRecorder } from "react-audio-voice-recorder";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

interface ChatBottombarProps {
  sendMessage: (newMessage: Message) => void;
  loggedUser: User;
  isMobile: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

interface Message {
  id?: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  sender?: User;
  receiver?: User;
}

interface MediaState {
  imageFile: File | null;
  audioBlob: Blob | null;
}

export const BottombarIcons = [{ icon: FileImage }, { icon: Paperclip }];

export default function ChatBottombar({ sendMessage, loggedUser, isMobile }: ChatBottombarProps) {
  const [message, setMessage] = useState("");
  const [showDropzone, setShowDropzone] = useState(false);
  const [mediaState, setMediaState] = useState<MediaState>({
    imageFile: null,
    audioBlob: null,
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      // Handle file drop
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type.startsWith("image")) {
          setMediaState({
            ...mediaState,
            imageFile: file,
          });
        } else if (file.type.startsWith("audio")) {
          setMediaState({
            ...mediaState,
            audioBlob: file,
          });
        }
      }
    },
    [mediaState]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleThumbsUp = () => {
    const newMessage: Message = {
      username: loggedUser.username,
      avatar: loggedInUserData.avatar,
      message: "👍",
    };
    sendMessage(newMessage);
    setMessage("");
  };

  const handleSend = async () => {
    if (message.trim() || mediaState.imageFile || mediaState.audioBlob) {
      try {
        let mediaUrl = null;

        if (mediaState.imageFile) {
          // Upload image to Cloudinary
          mediaUrl = await uploadToCloudinary(mediaState.imageFile);
        } else if (mediaState.audioBlob) {
          // Upload audio to Cloudinary
          mediaUrl = await uploadToCloudinary(mediaState.audioBlob);
        }

        const newMessage: Message = {
          username: loggedInUserData.name,
          avatar: loggedInUserData.avatar,
          message: message.trim(),
        };

        if (mediaUrl) {
          newMessage.message += ` ${mediaUrl}`;
        }

        sendMessage(newMessage);
        setMessage("");

        if (inputRef.current) {
          inputRef.current.focus();
        }

        // Reset media state after sending
        setMediaState({
          imageFile: null,
          audioBlob: null,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }

    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setMessage((prev) => prev + "\n");
    }
  };

  const handleDropzoneClose = () => {
    setShowDropzone(false);
  };

  const handleDropzoneSave = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image")) {
        setMediaState({
          ...mediaState,
          imageFile: file,
        });
      } else if (file.type.startsWith("audio")) {
        setMediaState({
          ...mediaState,
          audioBlob: file,
        });
      }
    }
    setShowDropzone(false);
  };

  const handleAudioStop = (audioData: Blob) => {
    setMediaState({
      ...mediaState,
      audioBlob: audioData,
    });
  };

  const uploadToCloudinary = async (file: File | Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "aiaufdub");
      // Replace with your Cloudinary upload preset
      formData.append("cloud_name", "dup8y2zdi");
      const response = await axios.post(
        `https://api.cloudinary.com:/v1_1/dup8y2zdi/image/upload`, // Replace with your Cloudinary cloud name
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Error uploading media file.");
    }
  };

  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      <div className="flex">
        <Popover>
          <PopoverTrigger asChild>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9",
                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
              )}
              onClick={() => setShowDropzone(true)}
            >
              <PlusCircle size={20} className="text-muted-foreground" />
            </Link>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-full p-2">
            {message.trim() || isMobile ? (
              <div className="flex gap-2">
                <div
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <AudioRecorder
                    onRecordingComplete={handleAudioStop}
                    audioTrackConstraints={{
                      noiseSuppression: true,
                      echoCancellation: true,
                    }}
                    downloadOnSavePress={true}
                    downloadFileExtension="webm"
                  />
                </div>

                <div
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  <Paperclip size={20} className="text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9",
                  "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                )}
                onClick={() => setShowDropzone(true)}
              >
                <AudioRecorder
                  onRecordingComplete={handleAudioStop}
                  audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true,
                  }}
                  downloadOnSavePress={true}
                  downloadFileExtension="webm"
                />
              </div>
            )}
          </PopoverContent>
        </Popover>
        {!message.trim() && !isMobile && (
          <div className="flex">
            <div
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9",
                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
              )}
              {...getRootProps()}
              // onClick={() => setShowDropzone(true)}
            >
              <input {...getInputProps()} />
              <Paperclip size={20} className="text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key="input"
          className="w-full relative"
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.05 },
            layout: {
              type: "spring",
              bounce: 0.15,
            },
          }}
        >
          <Textarea
            autoComplete="off"
            value={message}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="message"
            placeholder="Aa"
            className=" w-full border rounded-full flex items-center h-9 resize-none overflow-hidden bg-background"
          ></Textarea>
          <div className="absolute right-2 bottom-0.5  ">
            <EmojiPicker
              onChange={(value) => {
                setMessage(message + value);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />
          </div>
        </motion.div>

        {message.trim() ? (
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
            )}
            onClick={handleSend}
          >
            <SendHorizontal size={20} className="text-muted-foreground" />
          </Link>
        ) : (
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
            )}
            onClick={handleThumbsUp}
          >
            <ThumbsUp size={20} className="text-muted-foreground" />
          </Link>
        )}
      </AnimatePresence>
    </div>
  );
}
