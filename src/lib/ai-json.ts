export function toJson(o: any) {
  const raw =
    o?.text ??
    o?.output_text ??
    ((o?.candidates?.[0]?.content?.parts) || []).map((p: any) => p?.text).join('') ??
    (typeof o?.output === 'string' ? o.output : JSON.stringify(o?.output ?? ''));
  return JSON.parse(raw || '{}');
}
