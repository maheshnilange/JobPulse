import { WalkInDrive, WalkInStatus } from '../types';
import { db } from '../db';

export class WalkInService {
  /**
   * Recalculates and updates walk-in status based on current date
   */
  public static updateWalkInStatuses(referenceDateStr = '2026-08-30'): WalkInDrive[] {
    const today = new Date(referenceDateStr);
    const todayStr = referenceDateStr; // e.g. 2026-08-30
    
    // Calculate tomorrow date string
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    db.walkIns.forEach(walkin => {
      const interviewDate = walkin.interviewDate;

      if (interviewDate < todayStr) {
        walkin.status = 'EXPIRED';
      } else if (interviewDate === todayStr) {
        walkin.status = 'TODAY';
      } else if (interviewDate === tomorrowStr) {
        walkin.status = 'TOMORROW';
      } else if (interviewDate > tomorrowStr) {
        walkin.status = 'UPCOMING';
      }
    });

    return db.walkIns;
  }

  /**
   * Returns active/upcoming walk-ins sorted with Today & Tomorrow first, then chronologically
   */
  public static getWalkIns(filter?: { status?: string; city?: string; search?: string }): WalkInDrive[] {
    this.updateWalkInStatuses();
    let list = [...db.walkIns];

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter(w => w.status === filter.status);
    }

    if (filter?.city && filter.city !== 'ALL') {
      list = list.filter(w => w.city.toLowerCase() === filter.city?.toLowerCase());
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(w => 
        w.role.toLowerCase().includes(q) ||
        w.companyName.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q) ||
        w.venue.toLowerCase().includes(q) ||
        w.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    // Sort order: TODAY -> TOMORROW -> UPCOMING -> EXPIRED
    const statusPriority: Record<WalkInStatus, number> = {
      TODAY: 1,
      TOMORROW: 2,
      ACTIVE: 3,
      UPCOMING: 4,
      VERIFICATION_REQUIRED: 5,
      EXPIRED: 6
    };

    return list.sort((a, b) => {
      const prioDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
      if (prioDiff !== 0) return prioDiff;
      return a.interviewDate.localeCompare(b.interviewDate);
    });
  }
}
