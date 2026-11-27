"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateStatus } from "@/app/actions";

const states = ["Baru", "Dihubungi", "Diterima"] as const;

function StatusSelect({
  fullName,
  status,
  onChange,
}: {
  fullName: string;
  status: string;
  onChange: (status: string) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <select
        className="registrant-status-select"
        name="status"
        aria-label={"Status " + fullName}
        aria-busy={pending}
        value={status}
        disabled={pending}
        required
        onChange={(event) => {
          const nextStatus = event.currentTarget.value;
          const form = event.currentTarget.form;
          onChange(nextStatus);
          requestAnimationFrame(() => form?.requestSubmit());
        }}
      >
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      <span className="registrant-status-feedback" aria-live="polite">
        {pending ? "Menyimpan..." : ""}
      </span>
    </>
  );
}

export function AdminRegistrantStatus({
  id,
  fullName,
  status,
}: {
  id: string;
  fullName: string;
  status: string;
}) {
  const [selectedStatus, setSelectedStatus] = useState(status);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  async function saveStatus(formData: FormData) {
    try {
      const savedStatus = await updateStatus(formData);
      setSelectedStatus(savedStatus);
    } catch (error) {
      setSelectedStatus(status);
      throw error;
    }
  }

  return (
    <form
      action={saveStatus}
      className="registrant-status-form flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <StatusSelect
        fullName={fullName}
        status={selectedStatus}
        onChange={setSelectedStatus}
      />
    </form>
  );
}
