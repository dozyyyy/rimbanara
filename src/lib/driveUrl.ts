/**
 * Image URL helpers for the admin panel (PRD §5.4).
 *
 * Photos are stored as HTTPS links, never uploads. Google Drive share links do
 * not render in an <img> tag, so they must be converted to the direct
 * `uc?export=view&id=<ID>` form. The Drive file itself has to be shared as
 * "Anyone with the link" by the person who pasted it.
 */

/** `https://drive.google.com/file/d/<ID>/view...` (or edit/preview). */
const DRIVE_FILE_PATTERN =
  /^https:\/\/drive\.google\.com\/file\/d\/([^/?#]+)(?:\/(?:view|edit|preview))?(?:[?#].*)?$/i

/**
 * True when the value is a non-empty `https://` URL. PRD §5.4 requires the
 * admin to reject anything else (empty image URLs are allowed separately).
 */
export function isHttpsUrl(value: string): boolean {
  const url = value.trim()
  if (!url.toLowerCase().startsWith('https://')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.length > 0
  } catch {
    return false
  }
}

/**
 * Converts a Google Drive share link to a direct image URL.
 *
 * Any other value (already converted Drive links, `lh3.googleusercontent.com`
 * URLs, empty strings, invalid input) is returned unchanged, so this helper is
 * safe to run over whatever the admin pasted.
 */
export function convertDriveUrl(value: string): string {
  const url = value.trim()
  const match = DRIVE_FILE_PATTERN.exec(url)
  if (!match) return url
  return `https://drive.google.com/uc?export=view&id=${match[1]}`
}
