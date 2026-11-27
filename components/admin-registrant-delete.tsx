"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { TriangleAlert } from "lucide-react";
import { deleteRegistration } from "@/app/actions";

function DeleteButton({
  fullName,
  onPendingChange,
}: {
  fullName: string;
  onPendingChange: (pending: boolean) => void;
}) {
  const { pending } = useFormStatus();

  useEffect(() => onPendingChange(pending), [onPendingChange, pending]);

  return (
    <button
      className="registrant-delete-button"
      type="submit"
      disabled={pending}
      aria-label={`Hapus data pendaftaran ${fullName}`}
    >
      {pending ? "Menghapus..." : "Ya, hapus"}
    </button>
  );
}

export function AdminRegistrantDelete({
  id,
  fullName,
}: {
  id: string;
  fullName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const setPendingState = useCallback((value: boolean) => {
    setPending(value);
  }, []);
  const titleId = `registrant-delete-title-${id}`;
  const descriptionId = `registrant-delete-description-${id}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  function closeDialog() {
    if (pending) return;
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="registrant-delete-trigger"
        type="button"
        aria-label={`Hapus data pendaftaran ${fullName}`}
        onClick={() => setIsOpen(true)}
      >
        Hapus
      </button>
      <dialog
        ref={dialogRef}
        className="registrant-delete-dialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
      >
        <div className="registrant-delete-heading">
          <span className="registrant-delete-warning-icon">
            <TriangleAlert aria-hidden="true" />
          </span>
          <div>
            <h2 id={titleId}>Hapus data pendaftar?</h2>
            <p id={descriptionId}>
              Data pendaftaran <strong>{fullName}</strong> beserta seluruh
              berkasnya akan dihapus permanen. Tindakan ini tidak dapat
              dibatalkan.
            </p>
          </div>
        </div>
        <form
          action={deleteRegistration}
          className="registrant-delete-form"
          onSubmit={() => setPending(true)}
        >
          <input type="hidden" name="id" value={id} />
          <div className="registrant-delete-actions">
            <button
              ref={cancelRef}
              className="registrant-delete-cancel"
              type="button"
              disabled={pending}
              onClick={closeDialog}
            >
              Batal
            </button>
            <DeleteButton
              fullName={fullName}
              onPendingChange={setPendingState}
            />
          </div>
          <span className="sr-only" aria-live="polite">
            {pending ? "Sedang menghapus data pendaftar." : ""}
          </span>
        </form>
      </dialog>
    </>
  );
}
