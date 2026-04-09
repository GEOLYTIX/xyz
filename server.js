// Vercel's Express detection expects this import in the entrypoint.
import express from 'express';

void express;

import app from '@geolytix/xyz-app/server';

export default app;
