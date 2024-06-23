export default function maskNumber(number) {
  const numberStr = number.toString();
  const length = numberStr.length;

  if (length <= 5) {
    return "*".repeat(length);
  }

  const firstThree = numberStr.slice(0, 3);
  const lastTwo = numberStr.slice(-2);
  const maskedMiddle = "*".repeat(length - 5);

  return firstThree + maskedMiddle + lastTwo;
}
