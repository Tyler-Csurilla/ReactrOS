export const imageFileRegex = /\.(png|jpe?g|gif|svg|webp|bmp|ico)([?#].*)?$/i;

export function isValidImageUrl(url: string): boolean {
    return typeof url === 'string' && imageFileRegex.test(url);
}
