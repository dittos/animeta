export async function loadTypeahead(): Promise<JQueryStatic> {
  var $ = (await import('jquery')).default;
  if (typeof window !== 'undefined') {
    var _jQuery = window.jQuery;
    window.jQuery = $;
    // @ts-ignore
    await import('./typeahead.bundle.js');
    window.jQuery = _jQuery;
  }
  return $
}
