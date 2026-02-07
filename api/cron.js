import { runCycle } from '../brain/core.js';

export default async function handler(req, res) {
  // Basic security: optional but recommended to prevent public triggering
  // const authHeader = req.headers.authorization;
  // if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
  //    return res.status(401).json({ success: false, message: 'Unauthorized' });
  // }

  console.log("⏰ Vercel Cron Triggered");

  try {
    await runCycle();
    return res.status(200).json({ success: true, message: 'Cycle Completed' });
  } catch (error) {
    console.error("Cron Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
