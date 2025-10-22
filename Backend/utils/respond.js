export function ok(res, data, meta) {
  return res.json({ success: true, data, meta });
}
export function created(res, data, meta) {
  return res.status(201).json({ success: true, data, meta });
}
export function bad(res, msg) {
  return res.status(400).json({ success: false, error: msg });
}
export function unauthorized(res, msg='Unauthorized') {
  return res.status(401).json({ success: false, error: msg });
}
export function forbidden(res, msg='Forbidden') {
  return res.status(403).json({ success: false, error: msg });
}
export function notFound(res, msg='Not found') {
  return res.status(404).json({ success: false, error: msg });
}
export function serverError(res, e) {
  console.error(e);
  return res.status(500).json({ success: false, error: 'Server error' });
}
