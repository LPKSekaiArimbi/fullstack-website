"use client";
import {
  cloneElement,
  createContext,
  isValidElement,
  useActionState,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ChangeEvent,
  type Dispatch,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { register, login, type Result } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrationDocuments } from "@/lib/registration";
import { getTodayInJakarta, parseIndonesianDate } from "@/lib/indonesian-date";
import {
  setRegistrationChangesUnsaved,
  setRegistrationNavigationWarningHandler,
} from "@/lib/registration-navigation";
import { Eye, EyeOff } from "lucide-react";

type FieldErrors = Record<string, string>;
type FieldControl =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;
type FieldControlProps = {
  name?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};
const FieldErrorsContext = createContext<FieldErrors>({});

function FilePreviewLink({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl) return null;
  return (
    <a
      className="selected-file-preview"
      href={previewUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Pratinjau ${file.name} di tab baru`}
    >
      Lihat PDF
    </a>
  );
}

function PasswordInput(props: ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <Input
        {...props}
        id="admin-password"
        type={visible ? "text" : "password"}
      />
      <button
        className="password-toggle"
        type="button"
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-controls="admin-password"
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? (
          <EyeOff aria-hidden="true" />
        ) : (
          <Eye aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function isFieldControl(target: EventTarget): target is FieldControl {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function getSpecificFieldError(control: FieldControl) {
  if (control.name === "birth_date") {
    if (!control.value) return "Tanggal lahir wajib diisi.";
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(control.value))
      return "Gunakan format tanggal dd/mm/yyyy.";
    const isoDate = parseIndonesianDate(control.value);
    if (!isoDate) return "Masukkan tanggal lahir yang valid.";
    if (isoDate > getTodayInJakarta())
      return "Tanggal lahir tidak boleh melebihi hari ini.";
  }
  if (control.name === "phone") {
    const phone = control.value.replace(/[\s()-]/g, "");
    if (!phone) return "Nomor WhatsApp wajib diisi.";
    if (!/^\+?\d{8,15}$/.test(phone))
      return "Masukkan nomor WhatsApp yang terdiri dari 8–15 digit.";
  }
  return undefined;
}

function isFieldValid(control: FieldControl) {
  return control.validity.valid && !getSpecificFieldError(control);
}

function getFieldError(control: FieldControl) {
  const specificError = getSpecificFieldError(control);
  if (specificError) return specificError;
  if (control.validity.valueMissing)
    return control instanceof HTMLInputElement && control.type === "file"
      ? "Berkas ini wajib diunggah."
      : "Kolom ini wajib diisi.";
  if (control.validity.typeMismatch)
    return "Masukkan alamat email yang valid.";
  if (control.validity.patternMismatch)
    return control.title || "Format data tidak sesuai.";
  if (control.validity.rangeUnderflow || control.validity.rangeOverflow) {
    if (control instanceof HTMLInputElement && control.type === "date")
      return "Tanggal lahir tidak boleh melebihi hari ini.";
    if (control instanceof HTMLInputElement)
      return `Nilai harus antara ${control.min} dan ${control.max}.`;
  }
  if (control.validity.stepMismatch) return "Masukkan nilai bilangan bulat.";
  if (
    control.validity.tooLong &&
    (control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement)
  )
    return `Maksimal ${control.maxLength} karakter.`;
  if (control.validity.badInput) return "Masukkan nilai yang valid.";
  return "Data tidak sesuai kriteria.";
}

function syncCustomValidity(target: EventTarget) {
  if (!isFieldControl(target)) return;
  if (target.name === "birth_date" || target.name === "phone")
    target.setCustomValidity(getSpecificFieldError(target) ?? "");
}

function captureInvalid(
  event: FormEvent<HTMLFormElement>,
  setFieldErrors: Dispatch<SetStateAction<FieldErrors>>,
) {
  const control = event.target;
  if (!isFieldControl(control) || !control.name) return;
  setFieldErrors((current) => ({
    ...current,
    [control.name]: getFieldError(control),
  }));
}

function updateFieldError(
  target: EventTarget,
  setFieldErrors: Dispatch<SetStateAction<FieldErrors>>,
) {
  if (!isFieldControl(target) || !target.name) return;
  setFieldErrors((current) => {
    if (!(target.name in current)) return current;
    const updated = { ...current };
    if (isFieldValid(target)) delete updated[target.name];
    else updated[target.name] = getFieldError(target);
    return updated;
  });
}

function validateFieldOnBlur(
  target: EventTarget,
  setFieldErrors: Dispatch<SetStateAction<FieldErrors>>,
) {
  if (!isFieldControl(target) || !target.name) return;
  setFieldErrors((current) => {
    const updated = { ...current };
    if (isFieldValid(target)) delete updated[target.name];
    else updated[target.name] = getFieldError(target);
    return updated;
  });
}

function setInputFiles(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
}

function Field({
  label,
  children,
  optional = false,
}: {
  label: string;
  children: ReactNode;
  optional?: boolean;
}) {
  const errors = useContext(FieldErrorsContext);
  const control = isValidElement<FieldControlProps>(children) ? children : null;
  const name = control?.props.name;
  const error = name ? errors[name] : undefined;
  const errorId = name ? `${name}-error` : undefined;
  const describedBy = [
    control?.props["aria-describedby"],
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-field">
      <label>
        <span>
          {label}
          {!optional && (
            <span className="required-mark" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {control && error
          ? cloneElement(control, {
              "aria-invalid": true,
              "aria-describedby": describedBy,
            })
          : children}
      </label>
      {error && (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function RegistrationForm({ id }: { id: string }) {
  const [state, submit, busy] = useActionState<Result, FormData>(register, {});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const hasUnsavedChanges = useRef(false);
  useEffect(() => setFieldErrors(state.fieldErrors ?? {}), [state]);
  useEffect(() => {
    if (state.number) {
      hasUnsavedChanges.current = false;
      setRegistrationChangesUnsaved(false);
    }
  }, [state.number]);

  useEffect(() => {
    setRegistrationNavigationWarningHandler(() =>
      setShowNavigationWarning(true),
    );
    return () => {
      setRegistrationNavigationWarningHandler(null);
      setRegistrationChangesUnsaved(false);
    };
  }, []);

  useEffect(() => {
    const warning =
      "Data dan berkas pendaftaran belum dikirim. Yakin ingin meninggalkan halaman?";
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const guardLinkNavigation = (event: MouseEvent) => {
      if (
        !hasUnsavedChanges.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        (link.target && link.target.toLowerCase() !== "_self") ||
        link.hasAttribute("download") ||
        new URL(link.href, window.location.href).href === window.location.href
      )
        return;
      if (window.confirm(warning)) {
        hasUnsavedChanges.current = false;
        setRegistrationChangesUnsaved(false);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    document.addEventListener("click", guardLinkNavigation, true);
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => {
      document.removeEventListener("click", guardLinkNavigation, true);
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, []);

  function handleFileChange(
    name: string,
    multiple: boolean,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const addedFiles = Array.from(event.currentTarget.files ?? []);
    const files = multiple
      ? [...(selectedFiles[name] ?? []), ...addedFiles]
      : addedFiles;
    setInputFiles(event.currentTarget, files);
    setSelectedFiles((current) => ({ ...current, [name]: files }));
    updateFieldError(event.currentTarget, setFieldErrors);
  }

  function removeSelectedFile(name: string, index: number) {
    const input = fileInputRefs.current[name];
    if (!input) return;
    const files = (selectedFiles[name] ?? []).filter(
      (_, fileIndex) => fileIndex !== index,
    );
    setInputFiles(input, files);
    setSelectedFiles((current) => ({ ...current, [name]: files }));
    updateFieldError(input, setFieldErrors);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const fileInputs = Array.from(
      event.currentTarget.querySelectorAll<HTMLInputElement>(
        'input[type="file"]',
      ),
    );
    const selectedInputs = fileInputs.filter((input) => input.files?.length);
    const totalSize = selectedInputs.reduce(
      (total, input) =>
        total +
        Array.from(input.files ?? []).reduce(
          (fileTotal, file) => fileTotal + file.size,
          0,
        ),
      0,
    );
    const oversizedInputs = selectedInputs.filter((input) =>
      Array.from(input.files ?? []).some((file) => file.size > 1_000_000),
    );
    if (!oversizedInputs.length && totalSize <= 3_500_000) return;

    event.preventDefault();
    setFieldErrors((current) => {
      const updated = { ...current };
      for (const input of oversizedInputs)
        updated[input.name] = "Setiap berkas tidak boleh lebih dari 1 MB.";
      if (totalSize > 3_500_000) {
        const lastSelected = selectedInputs[selectedInputs.length - 1];
        if (lastSelected) {
          const totalError =
            "Ukuran total semua berkas tidak boleh lebih dari 3,5 MB.";
          updated[lastSelected.name] = updated[lastSelected.name]
            ? `${updated[lastSelected.name]} ${totalError}`
            : totalError;
        }
      }
      return updated;
    });
  }

  if (state.number)
    return (
      <div role="status">
        <h1>Pendaftaran diterima</h1>
        <p className="form-lead mt-4">
          Simpan nomor ini sebagai bukti pendaftaranmu.
        </p>
        <p className="receipt-number my-5">{state.number}</p>
        <Button asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    );
  return (
    <>
      <h1>Formulir Pendaftaran</h1>
      <p className="form-lead mt-3">
        Isi data berikut untuk mendaftar sebagai calon siswa LPK Sekai Arimbi.
      </p>
      <p className="form-note">
        <span className="required-mark" aria-hidden="true">
          *
        </span>{" "}
        Wajib diisi
      </p>
      <FieldErrorsContext.Provider value={fieldErrors}>
        <form
          action={submit}
          onInvalidCapture={(event) => captureInvalid(event, setFieldErrors)}
          onBlur={(event: FocusEvent<HTMLFormElement>) => {
            syncCustomValidity(event.target);
            validateFieldOnBlur(event.target, setFieldErrors);
          }}
          onInput={(event) => {
            hasUnsavedChanges.current = true;
            setRegistrationChangesUnsaved(true);
            syncCustomValidity(event.target);
            updateFieldError(event.target, setFieldErrors);
          }}
          onChange={(event) => {
            hasUnsavedChanges.current = true;
            setRegistrationChangesUnsaved(true);
            syncCustomValidity(event.target);
            updateFieldError(event.target, setFieldErrors);
          }}
          onSubmit={handleSubmit}
        >
        <input type="hidden" name="id" value={id} />
        <Field label="Nama Lengkap">
          <Input
            name="name"
            autoComplete="name"
            maxLength={120}
            required
            placeholder="Nama lengkap kamu"
          />
        </Field>
        <Field label="NIK">
          <Input
            name="nik"
            inputMode="numeric"
            pattern="[0-9]{16}"
            title="NIK harus terdiri dari 16 digit angka."
            maxLength={16}
            required
            placeholder="16 digit NIK"
          />
        </Field>
        <Field label="Nomor Kartu Keluarga (KK)">
          <Input
            name="kk_number"
            inputMode="numeric"
            pattern="[0-9]{16}"
            title="Nomor KK harus terdiri dari 16 digit angka."
            maxLength={16}
            required
            placeholder="16 digit nomor KK"
          />
        </Field>
        <div className="form-fields">
          <Field label="Tempat Lahir">
            <Input name="birth_place" maxLength={100} required />
          </Field>
          <Field label="Tanggal Lahir">
            <Input
              name="birth_date"
              type="text"
              inputMode="numeric"
              maxLength={10}
              pattern="(?:0[1-9]|[12][0-9]|3[01])/(?:0[1-9]|1[0-2])/[0-9]{4}"
              title="Gunakan format tanggal dd/mm/yyyy."
              placeholder="dd/mm/yyyy"
              required
            />
          </Field>
        </div>
        <Field label="Jenis Kelamin">
          <select name="gender" required defaultValue="">
            <option value="" disabled>
              Pilih jenis kelamin
            </option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </Field>
        <Field label="Agama">
          <select name="religion" required defaultValue="">
            <option value="" disabled>
              Pilih agama
            </option>
            {["Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"].map(
              (religion) => (
                <option key={religion}>{religion}</option>
              ),
            )}
          </select>
        </Field>
        <Field label="Status Pernikahan">
          <select name="marital_status" required defaultValue="">
            <option value="" disabled>
              Pilih status pernikahan
            </option>
            {["Belum menikah", "Menikah", "Cerai hidup", "Cerai mati"].map(
              (status) => (
                <option key={status}>{status}</option>
              ),
            )}
          </select>
        </Field>
        <Field label="Alamat Lengkap (sesuai KTP)">
          <textarea name="ktp_address" maxLength={500} required rows={3} />
        </Field>
        <Field label="Alamat Domisili (jika berbeda dengan KTP)" optional>
          <textarea name="domicile_address" maxLength={500} rows={3} />
        </Field>
        <Field label="Nomor WhatsApp (nomor aktif)">
          <Input
            name="phone"
            type="tel"
            autoComplete="tel"
            title="Masukkan nomor WhatsApp yang terdiri dari 8–15 digit."
            maxLength={25}
            required
            placeholder="Contoh: 081234567890"
          />
        </Field>
        <Field label="Email (email pribadi aktif)">
          <Input name="email" type="email" autoComplete="email" maxLength={254} required />
        </Field>
        <Field label="Pendidikan Terakhir">
          <select name="education_level" required defaultValue="">
            <option value="" disabled>
              Pilih pendidikan terakhir
            </option>
            {["SMP", "SMA", "SMK", "D3", "D4", "S1"].map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </Field>
        <Field label="Asal Institusi (Sekolah/Universitas)">
          <Input name="school_name" maxLength={150} required />
        </Field>
        <Field label="Jurusan (jurusan pendidikan)">
          <Input name="major" maxLength={120} required />
        </Field>
        <Field label="Tahun Kelulusan">
          <Input
            name="graduation_year"
            type="number"
            min={1950}
            max={new Date().getFullYear()}
            step={1}
            required
          />
        </Field>
        <div className="form-fields">
          <Field label="Tinggi Badan (cm)">
            <Input name="height_cm" type="number" min={100} max={230} required />
          </Field>
          <Field label="Berat Badan (kg)">
            <Input name="weight_kg" type="number" min={20} max={250} required />
          </Field>
        </div>
        <Field label="Golongan Darah">
          <select name="blood_type" required defaultValue="">
            <option value="" disabled>
              Pilih golongan darah
            </option>
            {["A", "B", "AB", "O", "Belum tahu"].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </Field>
        <Field label="Mata Minus">
          <Input
            name="eye_minus"
            maxLength={100}
            required
            placeholder="Contoh: Tidak minus atau kanan 1, kiri 1,5"
          />
        </Field>
        <section className="form-section" aria-labelledby="documents-title">
          <h2 id="documents-title">Upload berkas</h2>
          <p className="form-note">
            Unggah PDF saja. Maksimal 1 MB per berkas dan 3,5 MB untuk seluruh
            berkas.
          </p>
          <div className="upload-fields">
            {registrationDocuments.map(({ key, label, accept, multiple }) => {
              const name = `document_${key}`;
              const files = selectedFiles[name] ?? [];
              return (
                <div key={key}>
                  <Field label={label}>
                    <Input
                      ref={(input) => {
                        fileInputRefs.current[name] = input;
                      }}
                      type="file"
                      name={name}
                      className={multiple ? "multiple-file-input" : undefined}
                      accept={accept}
                      multiple={multiple}
                      required
                      onChange={(event) =>
                        handleFileChange(name, multiple, event)
                      }
                    />
                  </Field>
                  {files.length > 0 && (
                    <ul className="selected-files">
                      {files.map((file, index) => (
                        <li key={`${file.name}-${file.lastModified}-${index}`}>
                          <span className="selected-file-name">
                            {file.name}
                          </span>
                          <div className="selected-file-actions">
                            <FilePreviewLink file={file} />
                            <button
                              className="selected-file-remove"
                              type="button"
                              aria-label={`Hapus ${file.name}`}
                              onClick={() => removeSelectedFile(name, index)}
                            >
                              Hapus
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <p className="form-note">
          Data pribadi dan berkas digunakan LPK Sekai Arimbi untuk proses
          pendaftaran dan seleksi calon siswa.
        </p>
        <Button disabled={busy}>
          {busy ? "Mengirim…" : "Kirim Pendaftaran"}
        </Button>
      </form>
      {showNavigationWarning && (
        <div className="navigation-warning-backdrop">
          <section
            className="navigation-warning"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="navigation-warning-title"
            aria-describedby="navigation-warning-description"
          >
            <h2 id="navigation-warning-title">Data belum dikirim</h2>
            <p id="navigation-warning-description">
              Data dan berkas pendaftaranmu belum dikirim. Yakin ingin
              meninggalkan halaman?
            </p>
            <div className="navigation-warning-actions">
              <Button
                type="button"
                variant="outline"
                autoFocus
                onClick={() => setShowNavigationWarning(false)}
              >
                Tetap mengisi
              </Button>
              <Button
                type="button"
                onClick={() => {
                  hasUnsavedChanges.current = false;
                  setRegistrationChangesUnsaved(false);
                  setShowNavigationWarning(false);
                  window.history.back();
                }}
              >
                Tinggalkan halaman
              </Button>
            </div>
          </section>
        </div>
      )}
      </FieldErrorsContext.Provider>
      {state.error && (
      <p className="form-validation-error" role="alert">
        {state.error}
      </p>
      )}
    </>
  );
}
export function LoginForm() {
  const [state, submit, busy] = useActionState<Result, FormData>(login, {});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  useEffect(() => setFieldErrors(state.fieldErrors ?? {}), [state]);
  return (
    <>
      <h1>Login admin</h1>
      <p className="form-lead mt-3">
        Masuk untuk melihat dan mengelola pendaftaran siswa.
      </p>
      <FieldErrorsContext.Provider value={fieldErrors}>
        <form
          action={submit}
          onInvalidCapture={(event) => captureInvalid(event, setFieldErrors)}
          onInput={(event) => updateFieldError(event.target, setFieldErrors)}
          onChange={(event) => updateFieldError(event.target, setFieldErrors)}
        >
          <Field label="Email admin">
            <Input type="email" name="email" required autoComplete="username" />
          </Field>
          <Field label="Kata sandi">
            <PasswordInput
              type="password"
              name="password"
              required
              autoComplete="current-password"
              maxLength={512}
            />
          </Field>
          <Button disabled={busy}>{busy ? "Memeriksa…" : "Masuk"}</Button>
        </form>
      </FieldErrorsContext.Provider>
      {state.error && (
        <p className="form-validation-error" role="alert">
          {state.error}
        </p>
      )}
    </>
  );
}
