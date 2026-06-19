import React, { useState, useRef } from "react";
import { Send, Image, Sparkles, Radio, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface DraftingConsoleProps {
  onPublish: (text: string, mediaUrl?: string, alignment?: string) => void;
}

const COSMIC_IMAGES = [
  {
    name: "Stellar Nebula",
    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&auto=format&fit=crop&q=60",
  },
  {
    name: "Quantum Logic",
    url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=60",
  },
  {
    name: "Deep Space Relay",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60",
  },
  {
    name: "Cyberspace Grid",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
  }
];

const ALIGNMENT_FREQUENCIES = [
  "Main Relay",
  "Dev Colony",
  "Design Array",
  "AI Nexus",
  "Quantum Core"
];

const COSMIC_IDEAS = [
  "Sub-space routing protocols established. Synchronizing telemetry node with Alpha Centauri.",
  "Quantum compiler optimization complete. Cold starts reduced to 0ms across all edge arrays.",
  "Synthesizing ambient energy signatures. Visual interface alignment is peaking. #ambientWeb",
  "Neural relay sync achieved. The solar winds are favorable for micro-transmissions. #reactCompiler",
  "Visual clarity resolved. Every pixel of this interface is accounted for. #minimalistDesign"
];

export default function DraftingConsole({ onPublish }: DraftingConsoleProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // State for new features
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [selectedAlignment, setSelectedAlignment] = useState<string | null>(null);
  const [showAlignmentSelector, setShowAlignmentSelector] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [customMediaUrl, setCustomMediaUrl] = useState("");

  const maxLength = 280;
  const charsLeft = maxLength - content.length;
  const progress = Math.min(content.length / maxLength, 1);
  
  // SVG circular progress math
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const getProgressColor = () => {
    if (content.length > maxLength) return "stroke-rose-500";
    if (content.length > maxLength - 28) return "stroke-amber-500";
    if (content.length > maxLength * 0.7) return "stroke-indigo-500";
    return "stroke-teal-500";
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content.length <= maxLength) {
      onPublish(content.trim(), mediaUrl || undefined, selectedAlignment || undefined);
      setContent("");
      setMediaUrl(null);
      setSelectedAlignment(null);
      setShowMediaSelector(false);
      setShowAlignmentSelector(false);
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

  const translateToCosmicJargon = (text: string) => {
    let translated = text;
    const glossary: { [key: string]: string } = {
      "hello": "initiating dimensional greeting protocol. Hello",
      "app": "neural telemetry node",
      "application": "neural telemetry node",
      "website": "visual signal grid",
      "site": "visual signal grid",
      "code": "quantum logic matrices",
      "fast": "tachyon speed",
      "slow": "sub-light velocity",
      "design": "ambient alignment",
      "css": "spectral styling vectors",
      "javascript": "synaptic compiler scripts",
      "react": "React core relay matrix",
      "developer": "telemetry node architect",
      "programmer": "telemetry node architect",
      "computer": "quantum mainframe console",
      "data": "telemetry packet streams"
    };

    Object.keys(glossary).forEach((key) => {
      const regex = new RegExp(`\\b${key}\\b`, "gi");
      translated = translated.replace(regex, glossary[key]);
    });

    if (translated === text) {
      translated = `[Tachyon relay synchronized] ${text} #ambientWeb`;
    }

    return translated;
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setShowMediaSelector(false);
    setShowAlignmentSelector(false);
    
    setTimeout(() => {
      const finalContent = !content.trim()
        ? COSMIC_IDEAS[Math.floor(Math.random() * COSMIC_IDEAS.length)]
        : translateToCosmicJargon(content);
      
      setContent(finalContent);
      setIsSynthesizing(false);

      // Auto grow textarea height after update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }, 50);
    }, 900);
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
        
        {/* Synthesizing Loading Overlay */}
        {isSynthesizing && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-aether-glow/30 bg-aether-glow/5 text-aether-glow font-mono text-[10px] uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Synthesizing cosmic ideas... re-routing neural node logic...</span>
          </div>
        )}

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
              disabled={isSynthesizing}
              onChange={handleTextareaChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label="Draft a post"
              placeholder="What waves are you transmitting… (e.g. quantum link established)"
              className="w-full bg-transparent text-[16px] text-stellar-white placeholder-stardust-gray/60 border-none outline-none resize-none py-1.5 focus:ring-0 disabled:opacity-50"
              style={{ minHeight: "56px" }}
            />
          </div>
        </div>

        {/* Selected Image Preview */}
        {mediaUrl && (
          <div className="relative group rounded-xl border border-cosmic-border/30 bg-zinc-950/20 overflow-hidden max-h-[160px] max-w-[240px] ml-14">
            <img src={mediaUrl} alt="Draft preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setMediaUrl(null)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-950/80 text-stardust-gray hover:text-rose-500 border border-cosmic-border transition-colors cursor-pointer"
              title="Remove media"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Active Alignment Badge */}
        {selectedAlignment && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-nebula-teal/30 bg-nebula-teal/5 text-nebula-teal font-mono text-[9px] uppercase tracking-wider animate-pulse ml-14 w-fit">
            <Radio className="w-3 h-3" />
            <span>Aligned to {selectedAlignment}</span>
            <button 
              type="button" 
              onClick={() => setSelectedAlignment(null)}
              className="ml-1 text-stardust-gray/40 hover:text-rose-500 font-bold transition-colors cursor-pointer"
              title="Clear alignment"
            >
              ×
            </button>
          </div>
        )}

        {/* Media Selector Drawer */}
        {showMediaSelector && (
          <div className="glass-panel p-4 rounded-xl border border-cosmic-border/30 bg-zinc-950/30 flex flex-col gap-3 animate-toast ml-14">
            <div className="font-mono text-[9px] uppercase text-stardust-gray/60 tracking-wider">Select Cosmic Telemetry Media</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COSMIC_IMAGES.map((img) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => {
                    setMediaUrl(img.url);
                    setShowMediaSelector(false);
                  }}
                  className={`relative rounded-lg overflow-hidden border transition-all h-16 cursor-pointer group ${
                    mediaUrl === img.url ? "border-aether-glow" : "border-cosmic-border hover:border-aether-glow/50"
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1">
                    <span className="font-display text-[9px] font-bold text-stellar-white text-center leading-tight">{img.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center border-t border-cosmic-border/10 pt-2.5">
              <input
                type="text"
                placeholder="Or input custom telemetry image URL..."
                value={customMediaUrl}
                onChange={(e) => setCustomMediaUrl(e.target.value)}
                className="flex-1 rounded-lg border border-cosmic-border bg-zinc-950/50 px-3 py-1.5 font-display text-[11px] text-stellar-white placeholder-stardust-gray/40 focus:border-aether-glow/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customMediaUrl.trim()) {
                    setMediaUrl(customMediaUrl.trim());
                    setCustomMediaUrl("");
                    setShowMediaSelector(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-aether-glow text-stellar-white font-mono text-[9px] tracking-wide uppercase cursor-pointer"
              >
                Attach
              </button>
            </div>
          </div>
        )}

        {/* Alignment Selector Drawer */}
        {showAlignmentSelector && (
          <div className="glass-panel p-4 rounded-xl border border-cosmic-border/30 bg-zinc-950/30 flex flex-col gap-2.5 animate-toast ml-14">
            <div className="font-mono text-[9px] uppercase text-stardust-gray/60 tracking-wider">Select Alignment Frequency Coordinates</div>
            <div className="flex flex-wrap gap-2">
              {ALIGNMENT_FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => {
                    setSelectedAlignment(freq);
                    setShowAlignmentSelector(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-[9px] tracking-wider uppercase transition-all cursor-pointer ${
                    selectedAlignment === freq
                      ? "bg-nebula-teal/10 border-nebula-teal text-nebula-teal shadow-[0_0_12px_rgba(20,184,166,0.1)]"
                      : "border-cosmic-border hover:border-nebula-teal/50 text-stardust-gray hover:text-stellar-white"
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        )}

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
              onClick={() => {
                setShowMediaSelector(!showMediaSelector);
                setShowAlignmentSelector(false);
              }}
              className={`p-2 rounded-lg transition-[color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 cursor-pointer ${
                showMediaSelector ? "text-aether-glow bg-zinc-900/40" : "text-stardust-gray hover:text-aether-glow hover:bg-zinc-900/40"
              }`}
              title="Add Media"
              aria-label="Add Media"
            >
              <Image className="w-[18px] h-[18px]" />
            </button>
            <button 
              type="button"
              onClick={() => {
                setShowAlignmentSelector(!showAlignmentSelector);
                setShowMediaSelector(false);
              }}
              className={`p-2 rounded-lg transition-[color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 cursor-pointer ${
                showAlignmentSelector ? "text-nebula-teal bg-zinc-900/40" : "text-stardust-gray hover:text-nebula-teal hover:bg-zinc-900/40"
              }`}
              title="Align Signal"
              aria-label="Align Signal"
            >
              <Radio className="w-[18px] h-[18px]" />
            </button>
            <button 
              type="button"
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="p-2 rounded-lg text-stardust-gray hover:text-indigo-400 hover:bg-zinc-900/40 transition-[color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 cursor-pointer disabled:opacity-50"
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
                  <circle
                    cx="14"
                    cy="14"
                    r={radius}
                    className="stroke-zinc-800"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
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
              disabled={!content.trim() || content.length > maxLength || isSynthesizing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display text-xs font-bold tracking-wide transition-[background-color,box-shadow,transform,filter] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-glow/50 ${
                content.trim() && content.length <= maxLength && !isSynthesizing
                  ? "bg-gradient-to-r from-aether-glow to-nebula-teal text-stellar-white hover:shadow-lg hover:shadow-indigo-500/15 hover:brightness-110 active:scale-95 cursor-pointer"
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
