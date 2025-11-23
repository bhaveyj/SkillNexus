/**
 * Generates a unique Google Meet-style link
 * Format: https://meet.google.com/xxx-yyyy-zzz
 */
export function generateMeetLink(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  
  const generateSegment = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const segment1 = generateSegment(3);
  const segment2 = generateSegment(4);
  const segment3 = generateSegment(3);

  return `https://meet.google.com/${segment1}-${segment2}-${segment3}`;
}

/**
 * Validates if a string is a valid Google Meet link format
 */
export function isValidMeetLink(link: string): boolean {
  const meetLinkPattern = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
  return meetLinkPattern.test(link);
}
