import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import type { MediaLimits } from "../api/constants";
import { format, text } from "../i18n";
import { PERCENT } from "../lib/constants";
import {
  describeImageFileProblem,
  describeMediaLimits,
  describeUploadFailure,
  toPercent,
  type UploadFile,
} from "../lib/media";
import {
  DRAG_DATA_FILES,
  IMAGE_UPLOAD_ASPECT,
  type ImageUploadAspect,
} from "./constants";
import { ImageIcon, UploadIcon } from "./icons";
import { Button, Field } from "./ui";

interface UploadInProgress {
  fileName: string;
  previewUrl: string;
  progress: number;
}

interface LocalPreview {
  key: string;
  url: string;
  fileName: string;
}

interface UploadResources {
  controller: AbortController | null;
  localPreviewUrl: string | null;
  objectUrls: Set<string>;
}

const carriesFiles = (event: DragEvent) =>
  event.dataTransfer.types.includes(DRAG_DATA_FILES);

export function ImageUpload({
  id,
  label,
  value,
  onChange,
  onBlur,
  upload,
  limits,
  previewSrc,
  aspect = IMAGE_UPLOAD_ASPECT.LANDSCAPE,
  required = false,
  hint,
  error,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string | null | undefined;
  onChange: (key: string | null) => void;
  onBlur?: () => void;
  upload: UploadFile;
  limits: MediaLimits;
  previewSrc?: string;
  aspect?: ImageUploadAspect;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [inProgress, setInProgress] = useState<UploadInProgress | null>(null);
  const [localPreview, setLocalPreview] = useState<LocalPreview | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resourcesRef = useRef<UploadResources>({
    controller: null,
    localPreviewUrl: null,
    objectUrls: new Set(),
  });

  useEffect(() => {
    const resources = resourcesRef.current;

    return () => {
      resources.controller?.abort();
      resources.objectUrls.forEach((url) => URL.revokeObjectURL(url));
      resources.objectUrls.clear();
    };
  }, []);

  const createPreviewUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    resourcesRef.current.objectUrls.add(url);
    return url;
  };

  const releasePreviewUrl = (url: string | null) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    resourcesRef.current.objectUrls.delete(url);
  };

  const startUpload = async (file: File) => {
    const problem = describeImageFileProblem(file, limits);
    if (problem) {
      setLocalError(problem);
      return;
    }

    const resources = resourcesRef.current;
    resources.controller?.abort();
    const controller = new AbortController();
    resources.controller = controller;

    const previewUrl = createPreviewUrl(file);
    setLocalError(null);
    setInProgress({ fileName: file.name, previewUrl, progress: 0 });

    try {
      const { key } = await upload(
        file,
        (progress) => {
          if (controller.signal.aborted) return;
          setInProgress((current) =>
            current?.previewUrl === previewUrl
              ? { ...current, progress }
              : current,
          );
        },
        controller.signal,
      );

      if (controller.signal.aborted) {
        releasePreviewUrl(previewUrl);
        return;
      }

      releasePreviewUrl(resources.localPreviewUrl);
      resources.localPreviewUrl = previewUrl;
      setLocalPreview({ key, url: previewUrl, fileName: file.name });
      setInProgress(null);
      onChange(key);
    } catch (cause) {
      releasePreviewUrl(previewUrl);
      if (controller.signal.aborted) return;

      setInProgress(null);
      setLocalError(describeUploadFailure(cause));
    } finally {
      if (resources.controller === controller) resources.controller = null;
    }
  };

  const cancelUpload = () => {
    resourcesRef.current.controller?.abort();
    setInProgress(null);
    inputRef.current?.focus();
  };

  const removeImage = () => {
    const resources = resourcesRef.current;
    releasePreviewUrl(resources.localPreviewUrl);
    resources.localPreviewUrl = null;
    setLocalPreview(null);
    setLocalError(null);
    onChange(null);
    inputRef.current?.focus();
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void startUpload(file);
  };

  const canDrop = !disabled && !inProgress;

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canDrop || !carriesFiles(event)) return;
    event.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setIsDragOver(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!canDrop) return;
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) void startUpload(file);
  };

  const hasImage = Boolean(value);
  const savedLocally = hasImage && localPreview?.key === value;
  const imageSrc =
    inProgress?.previewUrl ?? (savedLocally ? localPreview?.url : previewSrc);
  const fileName =
    inProgress?.fileName ?? (savedLocally ? localPreview?.fileName : undefined);
  const shownError = localError ?? error;
  const percent = inProgress ? toPercent(inProgress.progress) : 0;

  const classes = [
    "image-upload",
    `image-upload--${aspect}`,
    isDragOver ? "is-drag-over" : "",
    inProgress ? "is-uploading" : "",
    shownError ? "is-invalid" : "",
    disabled ? "is-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dropVeil = isDragOver && (
    <div className="image-upload__drop-veil" aria-hidden>
      <UploadIcon className="image-upload__icon" />
      {text.imageUpload.dropNow}
    </div>
  );

  return (
    <Field
      label={label}
      required={required}
      htmlFor={id}
      hint={hint}
      error={shownError}
    >
      <div
        className={classes}
        onDragEnter={onDragOver}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="image-upload__input"
          accept={limits.contentTypes.join()}
          disabled={disabled}
          tabIndex={hasImage || inProgress ? -1 : undefined}
          aria-required={required || undefined}
          aria-invalid={Boolean(shownError)}
          aria-describedby={
            hint || shownError ? `${id}-description` : undefined
          }
          onChange={onInputChange}
          onBlur={onBlur}
        />

        {hasImage || inProgress ? (
          <>
            <div className="image-upload__frame">
              {imageSrc ? (
                <img
                  className="image-upload__image"
                  src={imageSrc}
                  alt={format(text.imageUpload.previewAlt, { label })}
                />
              ) : (
                <div className="image-upload__placeholder">
                  <ImageIcon className="image-upload__icon" />
                  {text.imageUpload.noPreview}
                </div>
              )}

              {inProgress && (
                <div className="image-upload__overlay">
                  <div className="image-upload__panel">
                    <div
                      className="image-upload__progress"
                      role="progressbar"
                      aria-label={text.imageUpload.progressLabel}
                      aria-valuemin={0}
                      aria-valuemax={PERCENT}
                      aria-valuenow={percent}
                    >
                      <div
                        className="image-upload__progress-bar"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="image-upload__status">
                      {format(text.imageUpload.uploading, { percent })}
                    </span>
                    <Button size="small" onClick={cancelUpload}>
                      {text.imageUpload.cancel}
                    </Button>
                  </div>
                </div>
              )}

              {dropVeil}
            </div>

            {!inProgress && (
              <div className="image-upload__actions">
                {fileName && (
                  <span className="image-upload__file-name" title={fileName}>
                    {fileName}
                  </span>
                )}
                <Button
                  size="small"
                  disabled={disabled}
                  onClick={() => inputRef.current?.click()}
                >
                  {text.imageUpload.replace}
                </Button>
                <Button
                  size="small"
                  variant="danger-outline"
                  disabled={disabled}
                  onClick={removeImage}
                >
                  {text.imageUpload.remove}
                </Button>
              </div>
            )}
          </>
        ) : (
          <label htmlFor={id} className="image-upload__dropzone">
            <UploadIcon className="image-upload__icon" />
            <span className="image-upload__prompt">
              <span className="image-upload__choose">
                {isDragOver
                  ? text.imageUpload.dropNow
                  : text.imageUpload.choose}
              </span>
              {!isDragOver && <span>{text.imageUpload.dropHint}</span>}
            </span>
            <span className="image-upload__limits">
              {describeMediaLimits(limits)}
            </span>
          </label>
        )}
      </div>
    </Field>
  );
}
