export async function loadTypeahead(): Promise<JQueryStatic> {
  var $ = (await import('jquery')).default;
  if (typeof window !== 'undefined') {
    var _jQuery = window.jQuery;
    window.jQuery = $;
    await import('typeahead.js');
    window.jQuery = _jQuery;
  }
  return $
}
