export async function sendWinnerNotification(
  email: string,
  drawMonth: string,
  amount: number
): Promise<void> {
  // Stub: In production, call Resend API
  console.log(`[EMAIL] Winner notification sent to ${email}: Won £${amount} in draw ${drawMonth}`);
}

export async function sendWelcomeEmail(email: string, fullName: string): Promise<void> {
  // Stub: In production, call Resend API
  console.log(`[EMAIL] Welcome email sent to ${email} (${fullName})`);
}
