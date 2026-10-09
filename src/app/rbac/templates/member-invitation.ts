export function memberInvitationEmail(otp: string, role: string): { subject: string; html: string } {
 return {
        subject: "Invite to join our team",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>You've been invited to join our team!</h2>
                <p>You are invited to join our team as a ${role}. Use the code below to continue:</p>
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
                <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
        `
    };
}