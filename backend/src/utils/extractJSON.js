export default function extractJSON(str) {
  const match = str.match(/\{[^}]+\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return null;
    }
  }
  return null;
}
