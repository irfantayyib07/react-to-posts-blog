export const truncateAtNthWord = (inputString, n) => {
 const words = inputString.split(' ');
 const truncatedWords = words.slice(0, n);
 const truncatedString = truncatedWords.join(' ');
 return truncatedString;
}