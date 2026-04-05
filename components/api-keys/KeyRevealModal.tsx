import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/shared/CopyButton";

interface KeyRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  plainTextKey: string;
}

export function KeyRevealModal({ isOpen, onClose, plainTextKey }: KeyRevealModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Save Your API Key">
      <div className="bg-navy border border-teal rounded-xl p-6 mb-6 mt-4 relative shadow-[0_0_30px_rgba(0,200,150,0.1)]">
        <p className="text-foreground text-sm font-medium mb-4 leading-relaxed">
          Please copy this key and store it securely. For your protection, <span className="text-gold font-bold">you will not be able to see it again.</span>
        </p>
        
        <div className="flex items-center gap-2 bg-card-2 px-4 py-3 rounded-lg border border-border">
          <code className="font-mono text-lg text-teal flex-1 overflow-x-auto whitespace-nowrap">
            {plainTextKey}
          </code>
          <CopyButton text={plainTextKey} size="sm" />
        </div>
      </div>
      
      <div className="flex items-center justify-end mt-4">
        <Button onClick={onClose}>
          I&apos;ve copied it &mdash; Close
        </Button>
      </div>
    </Modal>
  );
}
