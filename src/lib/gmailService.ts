import { GoogleIdentityServicesAuth } from './gisAuth';

export interface GmailUserProfile {
  email: string;
  name?: string;
  picture?: string;
}

export interface ApplicationEmailPayload {
  to?: string;
  candidateName: string;
  candidateEmail: string;
  companyName: string;
  roleTitle: string;
  applicationId: string;
  appliedAt: string;
  matchScore: number;
  resumeFileName?: string;
  portalUrl?: string;
}

export interface TrackedEmailStatus {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  category: 'interview' | 'assessment' | 'confirmation' | 'update' | 'general';
  companyName?: string;
}

// Gmail API Client using Client-Side OAuth Token
class GmailService {
  private userProfile: GmailUserProfile | null = null;

  public async connect(): Promise<string> {
    const token = await GoogleIdentityServicesAuth.getValidToken();
    if (!token) {
      throw new Error('Failed to obtain Google authentication token');
    }
    // Fetch basic user profile from Google UserInfo
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        this.userProfile = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch user profile info', e);
    }
    return token;
  }

  public isConnected(): boolean {
    return GoogleIdentityServicesAuth.isAuthorized();
  }

  public disconnect(): void {
    GoogleIdentityServicesAuth.clearToken();
    this.userProfile = null;
  }

  public getConnectedEmail(): string | null {
    return this.userProfile?.email || null;
  }

  /**
   * Encodes a RFC 2822 email message to base64url format for Gmail API
   */
  private createRawEmail(to: string, from: string, subject: string, htmlBody: string): string {
    const emailLines = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlBody
    ];

    const email = emailLines.join('\r\n');
    return btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Send application confirmation alert directly to candidate's Gmail inbox
   */
  public async sendApplicationConfirmation(payload: ApplicationEmailPayload): Promise<{ success: boolean; messageId?: string }> {
    const token = await GoogleIdentityServicesAuth.getValidToken();
    if (!token) {
      throw new Error('Gmail not connected. Please connect your Gmail account to send application alerts.');
    }

    const recipient = payload.to || payload.candidateEmail || this.userProfile?.email || 'me';
    const subject = `JobPulse Application Dispatched: ${payload.roleTitle} at ${payload.companyName} [${payload.applicationId}]`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">JobPulse Application Notification</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Real-Time Fresher & Software Job Tracker</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; margin-top: 16px; border: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 12px; font-weight: 600; border: 1px solid #a7f3d0;">
              ✓ Application Submitted Successfully
            </span>
          </div>

          <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 4px 0;">${payload.roleTitle}</h2>
          <p style="font-size: 14px; color: #4338ca; font-weight: 600; margin: 0 0 16px 0;">${payload.companyName}</p>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; width: 40%;">Application ID</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600; font-family: monospace;">${payload.applicationId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Candidate Name</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${payload.candidateName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Candidate Email</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${payload.candidateEmail}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">Submitted Resume</td>
              <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${payload.resumeFileName || 'Candidate_Resume.pdf'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">ATS Match Fit</td>
              <td style="padding: 10px 0; color: #059669; font-weight: 700;">${payload.matchScore}% Match</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Submission Timestamp</td>
              <td style="padding: 10px 0; color: #0f172a;">${new Date(payload.appliedAt).toLocaleString()}</td>
            </tr>
          </table>

          ${payload.portalUrl ? `
            <div style="text-align: center; margin-top: 20px;">
              <a href="${payload.portalUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">
                View Company Career Portal
              </a>
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #94a3b8;">
          <p style="margin: 0;">This is an automated dispatch receipt generated by JobPulse application engine.</p>
        </div>
      </div>
    `;

    const raw = this.createRawEmail(recipient, 'me', subject, htmlBody);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to send Gmail message (${response.status})`);
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  }

  /**
   * Search and fetch application status updates, assessments, and interview invitations from Gmail
   */
  public async searchApplicationEmails(companyNames: string[] = []): Promise<TrackedEmailStatus[]> {
    const token = await GoogleIdentityServicesAuth.getValidToken();
    if (!token) {
      return [];
    }

    try {
      // Build search query for job hiring & assessment emails
      const keywords = ['"application received"', '"interview"', '"assessment test"', '"hackerrank"', '"codility"', '"shortlisted"', '"candidate status"', 'JobPulse'];
      const query = keywords.join(' OR ');

      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=15`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!listRes.ok) {
        console.warn('Failed to query Gmail messages');
        return [];
      }

      const listData = await listRes.json();
      const messages: { id: string }[] = listData.messages || [];

      const results: TrackedEmailStatus[] = [];

      for (const msg of messages.slice(0, 10)) {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (detailRes.ok) {
            const detail = await detailRes.json();
            const headers = detail.payload?.headers || [];
            const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'Job Notification';
            const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Recruiter';
            const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();

            let category: TrackedEmailStatus['category'] = 'general';
            const sLower = subjectHeader.toLowerCase();
            const snipLower = (detail.snippet || '').toLowerCase();

            if (sLower.includes('interview') || snipLower.includes('interview') || sLower.includes('discussion')) {
              category = 'interview';
            } else if (sLower.includes('assessment') || sLower.includes('test') || sLower.includes('hackerrank') || sLower.includes('oa')) {
              category = 'assessment';
            } else if (sLower.includes('dispatched') || sLower.includes('received') || sLower.includes('acknowledgement') || sLower.includes('applied')) {
              category = 'confirmation';
            } else if (sLower.includes('status') || sLower.includes('update') || sLower.includes('offer') || sLower.includes('selected')) {
              category = 'update';
            }

            // Detect company match if available
            const matchedCompany = companyNames.find(c => 
              subjectHeader.toLowerCase().includes(c.toLowerCase()) || 
              fromHeader.toLowerCase().includes(c.toLowerCase()) ||
              detail.snippet.toLowerCase().includes(c.toLowerCase())
            );

            results.push({
              id: detail.id,
              subject: subjectHeader,
              from: fromHeader,
              snippet: detail.snippet || '',
              date: dateHeader,
              category,
              companyName: matchedCompany
            });
          }
        } catch (e) {
          console.warn('Error fetching message details', e);
        }
      }

      return results;
    } catch (e) {
      console.error('Error tracking emails in Gmail', e);
      return [];
    }
  }
}

export const gmailService = new GmailService();
