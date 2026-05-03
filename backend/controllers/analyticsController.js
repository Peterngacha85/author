const Traffic = require('../models/Traffic');
const User = require('../models/User');

// Log a visit
exports.logVisit = async (req, res) => {
  try {
    const { path, referrer, sessionId, userAgent, browser, os, device } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const traffic = new Traffic({
      ip,
      path,
      referrer,
      sessionId,
      userAgent,
      browser,
      os,
      device,
      timestamp: new Date()
    });

    await traffic.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Log Visit Error:', err);
    res.status(500).json({ msg: 'Server error logging visit' });
  }
};

// Get analytics data for the dashboard
exports.getAnalytics = async (req, res) => {
  try {
    const totalVisits = await Traffic.countDocuments();
    const totalSignups = await User.countDocuments({ role: 'user' });
    
    // Calculate conversion rate from marked traffic
    const conversions = await Traffic.countDocuments({ isConversion: true });
    const conversionRate = totalVisits > 0 ? (conversions / totalVisits) * 100 : 0;

    // Get visits over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const visitsTimeline = await Traffic.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Get referral sources
    const referrers = await Traffic.aggregate([
      {
        $group: {
          _id: "$referrer",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get device distribution
    const devices = await Traffic.aggregate([
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      summary: {
        totalVisits,
        totalSignups,
        conversionRate: conversionRate.toFixed(2) + '%'
      },
      visitsTimeline,
      referrers,
      devices
    });
  } catch (err) {
    console.error('Get Analytics Error:', err);
    res.status(500).json({ msg: 'Server error fetching analytics' });
  }
};
