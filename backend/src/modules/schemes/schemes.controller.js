import { getAllSchemes } from './schemes.queries.js';

/**
 * GET /api/schemes
 * Returns a list of all government schemes.
 */
export async function getSchemes(req, res) {
  try {
    const data = await getAllSchemes();
    return res.json({ success: true, data });
  } catch (error) {
    console.error('[schemes.getSchemes]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
