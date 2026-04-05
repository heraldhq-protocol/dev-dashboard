import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface RevokeKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  keyName: string;
  isRevoking: boolean;
}

export function RevokeKeyModal({ isOpen, onClose, onConfirm, keyName, isRevoking }: RevokeKeyModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title="Revoke API Key">
      <div className="bg-red/10 border border-red/30 rounded-xl p-4 mb-6 mt-4">
        <h4 className="text-red font-bold text-sm mb-1">Danger Zone</h4>
        <p className="text-red/80 text-xs">
          You are about to permanently revoke the API key <strong>{keyName}</strong>. 
          Any applications currently using this key will immediately be denied access to the Herald network. This action cannot be undone.
        </p>
      </div>
      
      <div className="flex items-center justify-end gap-3 mt-8">
        <Button variant="ghost" onClick={onClose} disabled={isRevoking}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isRevoking}>
          Yes, Revoke Key
        </Button>
      </div>
    </Modal>
  );
}
