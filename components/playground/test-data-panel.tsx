import { useComposerStore } from "@/hooks/use-composer-store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";

export function TestDataPanel() {
  const { testData, setTestData, removeTestData } = useComposerStore();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    if (newKey.trim()) {
      setTestData(newKey.trim(), newValue);
      setNewKey("");
      setNewValue("");
    }
  };

  return (
    <div className="bg-card-2 border-t border-border p-4 shadow-inner">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Preview Test Data</h3>
        <p className="text-xs text-text-muted mt-0.5">
          Variables in your template will be replaced with these values in the preview.
        </p>
      </div>
      
      <div className="space-y-3 max-h-[300px] sm:max-h-[160px] overflow-y-auto pr-2">
        {Object.entries(testData).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-card-3/30 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-border/20 sm:border-0">
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={key}
                readOnly
                className="w-1/3 sm:w-[100px] bg-card-3 border-border/50 font-mono text-[10px] sm:text-xs text-text-muted h-7 sm:h-8"
              />
              <Input
                value={value}
                onChange={(e) => setTestData(key, e.target.value)}
                placeholder="Value"
                className="flex-1 h-7 sm:h-8 text-xs bg-card-2/50"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-text-muted hover:text-red-500"
                onClick={() => removeTestData(key)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Key"
              className="w-1/3 sm:w-[100px] h-7 sm:h-8 font-mono text-[10px] sm:text-xs bg-card-3/50"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              className="flex-1 h-7 sm:h-8 text-xs bg-card-2/50"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-teal hover:text-teal hover:bg-teal/10"
              onClick={handleAdd}
              disabled={!newKey.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
