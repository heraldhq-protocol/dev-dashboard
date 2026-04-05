"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Backwards-compatible Modal wrapper built on top of shadcn Dialog.
 * Preserves the `isOpen`/`open` + `onClose` + `title` convenience API
 * that existing pages rely on.
 */
export function Modal({ open, isOpen, onClose, title, children, className }: ModalProps) {
  const isModalOpen = open !== undefined ? open : isOpen;

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(val: boolean) => {
        if (!val && onClose) onClose();
      }}
    >
      <DialogContent className={className}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
