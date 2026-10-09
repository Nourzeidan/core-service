export function passwordResetTemplate(otp: string): { subject: string; html: string } {
 return {
        subject: "Reset your password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Reset your password</h2>
                <p>We received a request to reset your password. Use the code below to continue:</p>
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
                <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
        `
    };
}