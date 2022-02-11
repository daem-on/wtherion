/**
 * Localization object.
 * 
 * Because we use Webpack's DefinePlugin for replacing
 * localizations during building, TypeScript doesn't
 * know what the `lang` global is, so it's defined here.
 */
declare const lang: Record<string, string>;