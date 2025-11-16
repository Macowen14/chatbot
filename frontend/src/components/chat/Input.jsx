import React, { useState, useRef } from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { 
  Send, 
  Paperclip, 
  X, 
  FileText, 
  Image as ImageIcon, 
  File,
  Sparkles,
  ChevronDown,
  Zap
} from 'lucide-react';
import { AI_MODELS } from '../../assets/data';


function Input({ message, setMessage, handleSendMessage }) {
  const themeStyles = useThemeStyles();
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return ImageIcon;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    return File;
  };

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0) {
      handleSendMessage();
      setAttachedFiles([]);
    }
  };

  return (
    <div
      className="p-4 border-t relative"
      style={{
        backgroundColor: themeStyles.mainChatAreaBackground,
        borderColor: `${themeStyles.textIcons}20`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Model Selector Dropdown */}
        {showModelSelector && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowModelSelector(false)}
            />
            
            {/* Dropdown Menu */}
            <div
              className="absolute bottom-full mb-2 left-4 right-4 max-w-2xl mx-auto rounded-xl shadow-2xl overflow-hidden z-20 animate-slideUp"
              style={{
                backgroundColor: themeStyles.sidebarBackground,
                border: `1px solid ${themeStyles.textIcons}20`,
              }}
            >
              <div 
                className="p-3 border-b"
                style={{ borderColor: `${themeStyles.textIcons}20` }}
              >
                <p 
                  className="text-xs font-bold uppercase tracking-wider opacity-70"
                  style={{ color: themeStyles.textIcons }}
                >
                  Select AI Model
                </p>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {AI_MODELS.map((model) => {
                  const Icon = model.icon;
                  const isSelected = selectedModel.id === model.id;
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelSelector(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:scale-[0.99]"
                      style={{
                        backgroundColor: isSelected 
                          ? `${themeStyles.primaryActionColor}20` 
                          : 'transparent',
                        borderLeft: isSelected 
                          ? `3px solid ${themeStyles.primaryActionColor}` 
                          : '3px solid transparent',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: isSelected
                            ? themeStyles.primaryActionColor
                            : `${themeStyles.textIcons}10`,
                        }}
                      >
                        <Icon 
                          size={16} 
                          style={{ color: isSelected ? '#FFFFFF' : themeStyles.textIcons }}
                        />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: themeStyles.textIcons }}
                          >
                            {model.name}
                          </p>
                          {model.badge && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: themeStyles.primaryActionColor,
                                color: '#FFFFFF',
                              }}
                            >
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs opacity-60 mt-0.5"
                          style={{ color: themeStyles.textIcons }}
                        >
                          {model.description}
                        </p>
                      </div>
                      
                      {isSelected && (
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: themeStyles.primaryActionColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file) => {
              const FileIconComponent = getFileIcon(file.type);
              
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg group"
                  style={{
                    backgroundColor: `${themeStyles.textIcons}10`,
                    border: `1px solid ${themeStyles.textIcons}20`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${themeStyles.primaryActionColor}20` }}
                  >
                    <FileIconComponent 
                      size={16} 
                      style={{ color: themeStyles.primaryActionColor }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: themeStyles.textIcons }}
                    >
                      {file.name}
                    </p>
                    <p
                      className="text-xs opacity-60"
                      style={{ color: themeStyles.textIcons }}
                    >
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:scale-110"
                    style={{ color: themeStyles.textIcons }}
                  >
                    <X size={14} style={{color: themeStyles.primaryActionColor}} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input Container */}
        <div className="flex gap-2 items-end">
          {/* Main Input Area */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Model Selector Button */}
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-[0.99] self-start"
              style={{
                backgroundColor: `${themeStyles.textIcons}10`,
                border: `1px solid ${themeStyles.textIcons}20`,
              }}
            >
              <Sparkles 
                size={14} 
                style={{ color: themeStyles.primaryActionColor }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: themeStyles.textIcons }}
              >
                {selectedModel.name}
              </span>
              <ChevronDown 
                size={14} 
                style={{ color: themeStyles.textIcons }}
                className={`transition-transform ${showModelSelector ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Text Input with File Attachment */}
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ 
                backgroundColor: `${themeStyles.textIcons}10`,
                border: `2px solid ${themeStyles.textIcons}10`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = themeStyles.primaryActionColor;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${themeStyles.textIcons}10`;
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg transition-all hover:scale-110"
                style={{ 
                  backgroundColor: `${themeStyles.textIcons}10`,
                  color: themeStyles.textIcons 
                }}
                title="Attach files"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: themeStyles.textIcons }}
              />
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() && attachedFiles.length === 0}
            className="p-3 rounded-xl transition-all hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{
              backgroundColor: themeStyles.primaryActionColor,
              color: "#FFFFFF",
            }}
          >
            <Send size={20} />
          </button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-2 px-1">
          <p
            className="text-xs opacity-60"
            style={{ color: themeStyles.textIcons }}
          >
            Press Enter to send, Shift + Enter for new line
          </p>
          <p
            className="text-xs opacity-60"
            style={{ color: themeStyles.textIcons }}
          >
            Tokens: 125
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Input;