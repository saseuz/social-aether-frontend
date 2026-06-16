import React, { useState, useRef } from "react";
import { Send, Image, Sparkles, Radio } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface DraftingConsoleProps {
  onPublish: (text: string) => void;
}

export default function DraftingConsole({ onPublish }: DraftingConsoleProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const maxLength = 280;
  const charsLeft = maxLength - content.length;
  const progress = Math.min(content.length / maxLength, 1);
  
  // SVG circular progress math
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Choose progress circle color based on character usage
  const getProgressColor = () => {
    if (content.length > maxLength) return "stroke-rose-500";
    if (content.length > maxLength - 28) return "stroke-amber-500";
    if (content.length > maxLength * 0.7) return "stroke-indigo-500";
    return "stroke-teal-500";
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content.length <= maxLength) {
      onPublish(content.trim());
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    setContent(el.value);
    
    // Auto grow height
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div 
      className={`glass-panel rounded-2xl p-5 transition-[border-color,box-shadow,transform] duration-300 ${
        isFocused 
          ? "border-indigo-500/40 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/30" 
          : "border-cosmic-border/50"
      }`}
    >
      <form onSubmit={handlePublish} className="flex flex-col gap-4">
        {/* User avatar + Text area Row */}
        <div className="flex gap-4 items-start">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-tr from-aether-glow/20 to-nebula-teal/20 border border-cosmic-border flex items-center justify-center font-bold text-sm text-aether-glow">
            {user?.avatarText || "Æ"}
          </div>
          
          <div className="flex-1 min-w-0">
            <textarea
              id="post-textarea"
              ref={textareaRef}
              rows={2}
              value={content}
              onChange={handleTextareaChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label="Draft a post"
              placeholder="What waves are you transmitting… (e.g. quantum link established)"
              className="w-full bg-transparent text-[16px] text-stellar-white placeholder-stardust-gray/60 border-none outline-none resize-none py-1.5 focus:ring-0"
              style={{ minHeight: "56px" }}
            />
          </div>
        </div>

        {/* Divider line (pulsing when focused) */}
        <div 
          className={`h-[1px] w-full transition-colors duration-300 ${
            isFocused ? "bg-gradient-to-r from-aether-glow/40 via-nebula-teal/40 to-transparent" : "bg-cosmic-border/30"
          }`}
        />

        {/* Footer controls */}
        <div className="flex items-center justify-between">
          {/* Attachment options */}
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              className="p-2 rounded-lg text-stardust-gray hover:text-aether-glow hover:bg-zinc-900/40 transition-[color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50"
              title="Add Media"
              aria-label="Add Media"
            >
              <Image className="w-[18px] h-[18px]" />
            </button>
            <button 
              type="button"
              className="p-2 rounded-lg text-stardust-gray hover:text-nebula-teal hover:bg-zinc-900/40 transition-[color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50"
              title="Align Signal"
              aria-label="Align Signal"
            >
              <Radio className="w-[18px] h-[18px]" />
            </button>
            <button 
              type="button"
              className="p-2 rounded-lg text-stardust-gray hover:text-indigo-400 hover:bg-zinc-900/40 transition-[color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50"
              title="Synthesize Ideas"
              aria-label="Synthesize Ideas"
            >
              <Sparkles className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Character counter & submit button */}
          <div className="flex items-center gap-4">
            {/* SVG circle character limit indicator */}
            {content.length > 0 ? (
              <div className="relative flex items-center justify-center h-7 w-7">
                <svg className="transform -rotate-90 w-7 h-7" aria-hidden="true">
                  {/* Background Track circle */}
                  <circle
                    cx="14"
                    cy="14"
                    r={radius}
                    className="stroke-zinc-800"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  {/* Foreground Animated circle */}
                  <circle
                    cx="14"
                    cy="14"
                    r={radius}
                    className={`transition-all duration-150 ease-out ${getProgressColor()}`}
                    strokeWidth="2.5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Character warning numbers when getting close */}
                {charsLeft <= 28 ? (
                  <span className={`absolute font-mono text-[9px] font-bold ${
                    charsLeft < 0 ? "text-rose-500" : "text-amber-500"
                  }`}>
                    {charsLeft}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!content.trim() || content.length > maxLength}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display text-xs font-bold tracking-wide transition-[background-color,box-shadow,transform,filter] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-glow/50 ${
                content.trim() && content.length <= maxLength
                  ? "bg-gradient-to-r from-aether-glow to-nebula-teal text-stellar-white hover:shadow-lg hover:shadow-indigo-500/15 hover:brightness-110 active:scale-95"
                  : "bg-zinc-900/50 text-stardust-gray/40 border border-cosmic-border/30 cursor-not-allowed"
              }`}
            >
              <span>Transmit</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
