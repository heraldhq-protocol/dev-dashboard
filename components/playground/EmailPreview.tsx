"use client";

interface EmailPreviewProps {
  htmlSnippet: string | null;
  isLoading: boolean;
}

export function EmailPreview({ htmlSnippet, isLoading }: EmailPreviewProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm h-full min-h-[400px] lg:min-h-0 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-navy-2 shrink-0">
        <h3 className="text-sm font-bold text-foreground">Preview</h3>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-gold/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green/80" />
        </div>
      </div>
      
      <div className="flex-1 bg-white relative overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
          </div>
        ) : htmlSnippet ? (
          <div 
            className="w-full h-full overflow-auto p-4"
          >
            <div 
              className="max-w-full shadow-lg rounded overflow-hidden"
              dangerouslySetInnerHTML={{ __html: htmlSnippet }} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
            <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-xs font-medium">Click "Preview" to see rendering</p>
          </div>
        )}
      </div>
    </div>
  );
}
