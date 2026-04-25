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
      
      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
        {Object.entries(testData).map(([key, value]) => (
          <div key={key} className="flex gap-2 items-center">
            <Input
              value={key}
              readOnly
              className="w-1/3 bg-card-3 border-border/50 font-mono text-xs text-text-muted h-8"
            />
            <Input
              value={value}
              onChange={(e) => setTestData(key, e.target.value)}
              placeholder="Value"
              className="flex-1 h-8 text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-muted hover:text-red-500"
              onClick={() => removeTestData(key)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
        
        <div className="flex gap-2 items-center pt-1 border-t border-border/30">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="New variable (e.g., date)"
            className="w-1/3 h-8 font-mono text-xs"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1 h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-teal hover:text-teal hover:bg-teal/10"
            onClick={handleAdd}
            disabled={!newKey.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
