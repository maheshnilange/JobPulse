import { Job, NotificationItem, UserAlert } from '../types';
import { db } from '../db';

export class NotificationService {
  /**
   * Matches a newly detected job against all active user alerts
   */
  public static checkAndTriggerAlerts(job: Job): NotificationItem[] {
    const triggeredNotifs: NotificationItem[] = [];

    db.alerts.filter(a => a.active).forEach(alert => {
      let isMatch = false;

      // 1. Keyword match (title, skills, description)
      if (alert.keywords && alert.keywords.length > 0) {
        const fullJobText = `${job.title} ${job.skills.join(' ')} ${job.description}`.toLowerCase();
        const hasKeyword = alert.keywords.some(kw => fullJobText.includes(kw.toLowerCase()));
        if (!hasKeyword) return;
      }

      // 2. Location match
      if (alert.locations && alert.locations.length > 0) {
        const jobLoc = `${job.location} ${job.city}`.toLowerCase();
        const hasLocation = alert.locations.some(loc => jobLoc.includes(loc.toLowerCase()));
        if (!hasLocation) return;
      }

      // 3. Category match
      if (alert.jobCategories && alert.jobCategories.length > 0) {
        const hasCat = alert.jobCategories.some(cat => job.categories.includes(cat));
        if (!hasCat) return;
      }

      // 4. Experience match
      if (alert.experienceLevels && alert.experienceLevels.length > 0) {
        const expLower = job.experience.toLowerCase();
        const hasExp = alert.experienceLevels.some(e => expLower.includes(e.toLowerCase()) || (job.isFresher && e.toLowerCase().includes('fresher')));
        if (!hasExp) return;
      }

      isMatch = true;

      if (isMatch) {
        alert.matchCount += 1;
        alert.lastTriggeredAt = new Date().toISOString();

        const channelNames = alert.channels.map(c => {
          if (c === 'in_app') return 'In-App Toast';
          if (c === 'browser') return 'Browser Web Notification';
          if (c === 'email') return 'Email Alert';
          if (c === 'telegram') return 'Telegram Bot';
          if (c === 'discord') return 'Discord Webhook';
          return c;
        });

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          alertId: alert.id,
          jobId: job.id,
          title: `🔥 NEW ${job.isJava ? 'JAVA ' : ''}${job.isFresher ? 'FRESHER ' : ''}JOB ALERT`,
          companyName: job.companyName,
          role: job.title,
          experience: job.experience,
          location: job.location,
          salary: job.salary,
          sourceName: job.primarySourceName,
          jobUrl: job.jobUrl,
          detectedAt: new Date().toISOString(),
          read: false,
          channelsSent: channelNames
        };

        db.notifications.unshift(newNotif);
        triggeredNotifs.push(newNotif);
      }
    });

    return triggeredNotifs;
  }
}
