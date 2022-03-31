import type { LiteralUnion } from "type-fest";
import { dashify, isQuoted } from "../utils";

type KnownPermissions = LiteralUnion<
  | "accelerometer"
  | "ambientLightSensor"
  | "autoplay"
  | "battery"
  | "camera"
  | "displayCapture"
  | "documentDomain"
  | "encryptedMedia"
  | "executionWhileNotRendered"
  | "executionWhileOutOfViewport"
  | "fullscreen"
  | "gamepad"
  | "geolocation"
  | "gyroscope"
  | "layoutAnimations"
  | "legacyImageFormats"
  | "magnetometer"
  | "microphone"
  | "midi"
  | "navigationOverride"
  | "oversizedImages"
  | "payment"
  | "pictureInPicture"
  | "publickeyCredentialsGet"
  | "speakerSelection"
  | "syncXhr"
  | "unoptimizedImages"
  | "unsizedMedia"
  | "usb"
  | "screenWakeLock"
  | "webShare"
  | "xrSpatialTracking",
  string
>;

export type PermissionsPolicy = {
  [key in KnownPermissions]?: Array<string>;
};

const reservedPermissionKeywords = new Set(["self", "src", "*", "none"]);

export function createPermissionsPolicy(features: PermissionsPolicy): string {
  return Object.entries(features)
    .map(([key, featureValues]) => {
      if (!Array.isArray(featureValues)) {
        throw new Error(
          `The value of the "${key}" feature must be array of strings.`
        );
      }

      const allowedValuesSeen: Set<string> = new Set();

      featureValues.forEach((allowedValue) => {
        if (typeof allowedValue !== "string") {
          throw new Error(
            `The value of the "${key}" feature contains a non-string, which is not supported.`
          );
        }

        if (allowedValuesSeen.has(allowedValue)) {
          throw new Error(
            `The value of the "${key}" feature contains duplicates, which it shouldn't.`
          );
        }
        if (allowedValue === "'self'") {
          throw new Error("self must not be quoted.");
        }

        if (allowedValue === "'none'") {
          throw new Error("none must not be quoted.");
        }

        if (allowedValue === "'src'") {
          throw new Error("src must not be quoted.");
        }

        if (
          !reservedPermissionKeywords.has(allowedValue) &&
          !isQuoted(allowedValue)
        ) {
          throw new Error("values beside reserved keywords must be quoted.");
        }

        allowedValuesSeen.add(allowedValue);
      });

      if (featureValues.length > 1) {
        if (allowedValuesSeen.has("*")) {
          throw new Error(
            `The value of the "${key}" feature cannot contain * and other values.`
          );
        }

        if (allowedValuesSeen.has("'none'")) {
          throw new Error(
            `The value of the "${key}" feature cannot contain 'none' and other values.`
          );
        }
      }

      const featureKeyDashed = dashify(key);
      const featureValuesUnion = featureValues.join(" ");
      return `${featureKeyDashed}=(${featureValuesUnion})`;
    })
    .join(", ");
}
