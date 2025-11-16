import { Sparkles, Zap } from "lucide-react";

export const AI_MODELS = [
  { 
    id: 'gemini-2.5-pro', 
    name: 'Gemini 2.5 Pro', 
    description: 'Most capable model',
    icon: Sparkles,
    badge: 'Pro'
  },
  { 
    id: 'gemini-2.0-flash', 
    name: 'Gemini 2.0 Flash', 
    description: 'Fast responses',
    icon: Zap,
    badge: 'Fast'
  },
  { 
    id: 'claude-sonnet', 
    name: 'Claude Sonnet', 
    description: 'Balanced performance',
    icon: Sparkles,
    badge: null
  },
  { 
    id: 'gpt-4', 
    name: 'GPT-4', 
    description: 'OpenAI flagship',
    icon: Sparkles,
    badge: null
  },
];