import { createVercelHandler } from '../../utils/vercel-handler.js';

export default createVercelHandler(() => import('./server.js'));
