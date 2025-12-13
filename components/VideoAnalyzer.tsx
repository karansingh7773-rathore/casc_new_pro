import React, { useState, useRef, useEffect } from 'react';
import { analyzeVideoWithGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs'; // Import tfjs backend


interface VideoAnalyzerProps {
  videoUrl: string;
  videoFile: File;
  onClose: () => void;
}

// -- Styles --
const styleTag = `
  @keyframes blurIn {
    0% { filter: blur(8px); opacity: 0; transform: translateY(5px); }
    100% { filter: blur(0); opacity: 1; transform: translateY(0); }
  }
  .animate-blur-in {
    animation: blurIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  /* Typewriter cursor effect (optional) */
  .typing-cursor::after {
    content: '|';
    animation: blink 1s step-start infinite;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }
`;

// -- Sub-components --

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  // Simple regex-based markdown parser
  const parse = (input: string) => {
    let html = input
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-red-300">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic text-zinc-400">$1</em>')
      // Inline Code
      .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 px-1 py-0.5 rounded text-orange-300 font-mono text-xs">$1</code>')
      // Lists (simple dash)
      .replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br/>');

    return { __html: html };
  };

  return <div dangerouslySetInnerHTML={parse(text)} className="leading-relaxed" />;
};

const TypewriterMessage: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const hasCompleted = useRef(false);

  useEffect(() => {
    let index = 0;
    // Faster typing for longer text to avoid waiting too long
    const speed = text.length > 200 ? 5 : 15;

    const interval = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, index + 1));
      index++;

      if (index >= text.length) {
        clearInterval(interval);
        hasCompleted.current = true;
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <div className="animate-blur-in">
      <MarkdownRenderer text={displayedText} />
      {!hasCompleted.current && <span className="inline-block w-1.5 h-3 bg-red-400 ml-1 animate-pulse" />}
    </div>
  );
};

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ videoUrl, videoFile, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'I have analyzed the footage. What would you like to know regarding the incident?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [layoutPosition, setLayoutPosition] = useState<'right' | 'left'>('right');
  const [isYoloEnabled, setIsYoloEnabled] = useState(true); // Default to true to show it working immediately
  const [modelStatus, setModelStatus] = useState<string>('Initializing...');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Set slow playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  }, [videoUrl]);

  // Real Object Detection Loop (COCO-SSD)
  useEffect(() => {
    if (!isYoloEnabled || !videoRef.current || !canvasRef.current) return;

    let animationId: number;
    let model: cocoSsd.ObjectDetection | null = null;
    let isModelLoading = true;

    const loadModel = async () => {
      try {
        setModelStatus('Loading AI Model...');
        console.log("Loading COCO-SSD model...");
        model = await cocoSsd.load();
        isModelLoading = false;
        setModelStatus('AI Online');
        console.log("COCO-SSD model loaded.");
        detectFrame();
      } catch (err) {
        console.error("Failed to load COCO-SSD model:", err);
        setModelStatus('AI Failed to Load');
      }
    };

    const detectFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !model || !isYoloEnabled) return;

      if (videoRef.current.readyState === 4) { // HAVE_ENOUGH_DATA
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Set canvas resolution strictly to match display size for correct overlay
          const parent = canvas.parentElement;
          if (parent) {
            if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
              canvas.width = parent.clientWidth;
              canvas.height = parent.clientHeight;
            }
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Detect objects
          const predictions = await model.detect(video);

          // Calculate Scaling Factors
          // Map intrinsic video coordinates to displayed video element coordinates
          const videoRect = video.getBoundingClientRect();
          const canvasRect = canvas.getBoundingClientRect();

          // Video position relative to canvas (accounts for centering/letterboxing)
          const offsetX = videoRect.left - canvasRect.left;
          const offsetY = videoRect.top - canvasRect.top;

          // Ratio of displayed size vs intrinsic size
          const scaleX = videoRect.width / video.videoWidth;
          const scaleY = videoRect.height / video.videoHeight;

          predictions.forEach(prediction => {
            if (['person', 'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'dog', 'cat'].includes(prediction.class)) {

              // Scale Coordinates
              const x = (prediction.bbox[0] * scaleX) + offsetX;
              const y = (prediction.bbox[1] * scaleY) + offsetY;
              const width = prediction.bbox[2] * scaleX;
              const height = prediction.bbox[3] * scaleY;

              // Draw Bounding Box
              ctx.strokeStyle = prediction.class === 'person' ? '#ef4444' : '#3b82f6';
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, width, height);

              // Draw Label Background
              ctx.fillStyle = prediction.class === 'person' ? '#ef4444' : '#3b82f6';
              const textWidth = ctx.measureText(prediction.class).width;
              ctx.fillRect(x, y > 20 ? y - 20 : 0, textWidth + 40, 20);

              // Draw Text
              ctx.fillStyle = '#ffffff';
              ctx.font = '12px sans-serif';
              ctx.fillText(`${prediction.class} ${Math.round(prediction.score * 100)}%`, x + 5, y > 20 ? y - 6 : 14);
            }
          });

          // Draw "Inference Running" badge
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(10, 10, 170, 30);
          ctx.fillStyle = '#ef4444'; // Red dot
          ctx.beginPath();
          ctx.arc(25, 25, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('Real-time Object Detection', 40, 29);
        }
      }
      animationId = requestAnimationFrame(detectFrame);
    };

    loadModel();

    return () => {
      cancelAnimationFrame(animationId);
      // Optional: dispose model if needed, but coco-ssd manages itself mostly
    };
  }, [isYoloEnabled]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await analyzeVideoWithGemini(input, videoFile);
      const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Failed to analyze video.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-4">
      <style>{styleTag}</style>

      <div className={`w-full max-w-7xl h-[90vh] flex overflow-hidden rounded-2xl border border-orange-800/30 shadow-2xl relative bg-zinc-900/50 ${layoutPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
        }`}>

        {/* Global Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] bg-zinc-800 hover:bg-red-600 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center transition shadow-lg backdrop-blur-sm border border-orange-800/30 hover:border-red-500"
        >
          <iconify-icon icon="solar:close-circle-bold" class="text-sm"></iconify-icon>
        </button>

        {/* Video Player Section */}
        <div className="flex-1 bg-black flex items-center justify-center relative group overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="max-h-full max-w-full shadow-2xl object-contain"
            autoPlay
            loop
            muted
          />
          {/* YOLO Canvas Overlay */}
          {isYoloEnabled && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />
          )}

          <div className="absolute top-6 left-6 glass-panel border border-orange-800/30 px-4 py-2 rounded-lg text-sm text-white flex items-center gap-2 shadow-xl animate-clip z-20">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Evidence Footage</span>
          </div>

          {/* Model Status Indicator */}
          <div className="absolute bottom-6 left-6 glass-panel border border-orange-800/30 px-3 py-1.5 rounded-lg text-xs text-zinc-400 flex items-center gap-2 shadow-xl z-20">
            <span className={`w-1.5 h-1.5 rounded-full ${modelStatus === 'AI Online' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
            {modelStatus}
          </div>
        </div>

        {/* AI Chat Section */}
        <div className={`w-[450px] flex flex-col glass-panel shadow-2xl z-10 transition-all duration-300 ${layoutPosition === 'left' ? 'border-r border-l-0 border-orange-800/30' : 'border-l border-orange-800/30'
          }`}>
          {/* Custom Border Wrapper Requested */}
          <div className="flex flex-col h-full border-2 border-orange-800/20 m-2 rounded-xl overflow-hidden bg-zinc-900/50">

            {/* Header */}
            <div className="p-4 bg-zinc-800/80 border-b border-orange-800/20 flex justify-between items-center backdrop-blur-sm">
              <div>
                <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                  <iconify-icon icon="solar:bot-bold" class="text-red-500"></iconify-icon>
                  AI Assistant
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-wider">GEMINI 1.5 FLASH CONNECTED</p>
              </div>

              <div className="flex gap-2">
                {/* YOLO Toggle */}
                <button
                  onClick={() => setIsYoloEnabled(!isYoloEnabled)}
                  className={`p-2 rounded transition flex items-center justify-center ${isYoloEnabled ? 'text-red-500 bg-red-900/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-700'}`}
                  title="Toggle Computer Vision (YOLOv8)"
                >
                  <iconify-icon icon="solar:eye-scan-bold"></iconify-icon>
                </button>

                {/* Move/Toggle Button */}
                <button
                  onClick={() => setLayoutPosition(prev => prev === 'right' ? 'left' : 'right')}
                  className="text-zinc-500 hover:text-white hover:bg-zinc-700 p-2 rounded transition"
                  title="Toggle Panel Position"
                >
                  <iconify-icon icon="solar:transfer-horizontal-bold"></iconify-icon>
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-lg border border-white/10">
                      <iconify-icon icon="solar:cpu-bold" class="text-xs text-white"></iconify-icon>
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-md ${msg.role === 'user'
                    ? 'bg-zinc-100 text-zinc-900 rounded-tr-sm font-medium'
                    : 'bg-zinc-800 text-zinc-300 border border-orange-800/20 rounded-tl-sm'
                    }`}>
                    {msg.role === 'model' ? (
                      <TypewriterMessage text={msg.text} />
                    ) : (
                      <p>{msg.text}</p>
                    )}

                    <span className={`text-[10px] block text-right mt-2 ${msg.role === 'user' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 mr-3"></div>
                  <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700 w-24 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-800/80 border-t border-orange-800/20 backdrop-blur-sm">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about the footage..."
                  className="w-full bg-zinc-900/80 border border-orange-800/20 rounded-xl pl-4 pr-12 py-3.5 text-sm text-zinc-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-zinc-600"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-2 top-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white p-1.5 rounded-lg w-8 h-8 flex items-center justify-center transition-all shadow-lg"
                >
                  {isLoading ? <iconify-icon icon="svg-spinners:ring-resize" class="text-xs"></iconify-icon> : <iconify-icon icon="solar:arrow-up-linear" class="text-xs"></iconify-icon>}
                </button>
              </div>
              <p className="text-[10px] text-center text-zinc-600 mt-2">
                AI analysis may vary. Always verify with manual review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};