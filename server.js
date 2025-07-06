import express from 'express';
import { connectDB } from './config/db.js';
import app from './app.js';

// Initialize DB connection once
connectDB();

// Wrap Express app in a serverless handler
export default async (req, res) => {
  // This is the Vercel-compatible handler
  return app(req, res);
};