import { vars } from "nativewind";

export const themes = {
    light: vars({
     "--color-primary": "#f97316",
    "--color-secondary": "#3b82f6",    
      "--color-background": "#ffffff",   
      "--color-surface": "#f3f4f6",    
      "--color-border": "#e5e7eb",    
      "--color-text": "#111827", 
      "--color-text-muted": "#6b7280",
      "--color-error": "#ef4444",
    }),
    dark: vars({
        "--color-primary": "#fb923c",  
        "--color-secondary": "#60a5fa",    
      "--color-background": "#0f172a",   
      "--color-surface": "#1e293b",   
      "--color-border": "#334155",    
      "--color-text": "#f1f5f9",       
      "--color-text-muted": "#94a3b8",
      "--color-error": "#f87171",
    }),
  }; 
  