import { useState } from "react";
import { MEDIA_LIMITS, UPLOAD_PURPOSE } from "../api/constants";
import { IMAGE_UPLOAD_ASPECT } from "../components/constants";
import { ImageUpload } from "../components/ImageUpload";
import { PageHeader } from "../components/PageHeader";
import { format } from "../i18n";
import { SAMPLE_IMAGE_KEY } from "./constants";
import { createFakeUpload } from "./fake-upload";
import sampleImage from "./sample-image.svg";
import { ShowcaseGrid, ShowcaseSample, ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.media;
const imageCopy = copy.imageUpload;
const code = presentationText.code;

const component = (name: string) => format(code.component, { name });
const flag = (name: string) => format(code.flag, { name });
const prop = (name: string, value: string) =>
  format(code.prop, { name, value });

const fakeUpload = createFakeUpload();
const failingUpload = createFakeUpload({ fails: true });
const coverLimits = MEDIA_LIMITS[UPLOAD_PURPOSE.COVER];

export function MediaPage() {
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(SAMPLE_IMAGE_KEY);
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [failingKey, setFailingKey] = useState<string | null>(SAMPLE_IMAGE_KEY);
  const [requiredKey, setRequiredKey] = useState<string | null>(null);

  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={imageCopy.title}
        code={component("ImageUpload")}
        description={imageCopy.description}
      >
        <ShowcaseGrid isWide>
          <ShowcaseSample note={imageCopy.default}>
            <ImageUpload
              id="image-default"
              label={imageCopy.label}
              value={coverKey}
              onChange={setCoverKey}
              upload={fakeUpload}
              limits={coverLimits}
            />
            <span className="mono muted">
              {coverKey
                ? format(imageCopy.value, { key: coverKey })
                : imageCopy.noValue}
            </span>
          </ShowcaseSample>
          <ShowcaseSample code={flag("previewSrc")} note={imageCopy.saved}>
            <ImageUpload
              id="image-saved"
              label={imageCopy.label}
              value={savedKey}
              onChange={setSavedKey}
              upload={fakeUpload}
              limits={coverLimits}
              previewSrc={sampleImage}
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={prop("aspect", IMAGE_UPLOAD_ASPECT.SQUARE)}
            note={imageCopy.square}
          >
            <ImageUpload
              id="image-square"
              label={imageCopy.avatarLabel}
              value={avatarKey}
              onChange={setAvatarKey}
              upload={fakeUpload}
              limits={MEDIA_LIMITS[UPLOAD_PURPOSE.AVATAR]}
              aspect={IMAGE_UPLOAD_ASPECT.SQUARE}
            />
          </ShowcaseSample>
          <ShowcaseSample note={imageCopy.failing}>
            <ImageUpload
              id="image-failing"
              label={imageCopy.label}
              value={failingKey}
              onChange={setFailingKey}
              upload={failingUpload}
              limits={coverLimits}
              previewSrc={sampleImage}
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flags, { first: "required", second: "error" })}
            note={imageCopy.required}
          >
            <ImageUpload
              id="image-required"
              label={imageCopy.label}
              value={requiredKey}
              onChange={setRequiredKey}
              upload={fakeUpload}
              limits={coverLimits}
              required
              error={requiredKey ? undefined : imageCopy.requiredError}
            />
          </ShowcaseSample>
          <ShowcaseSample code={flag("disabled")} note={imageCopy.disabled}>
            <ImageUpload
              id="image-disabled"
              label={imageCopy.label}
              value={SAMPLE_IMAGE_KEY}
              onChange={() => {}}
              upload={fakeUpload}
              limits={coverLimits}
              previewSrc={sampleImage}
              disabled
            />
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>
    </div>
  );
}
