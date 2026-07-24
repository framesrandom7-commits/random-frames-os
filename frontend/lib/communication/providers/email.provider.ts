export class EmailProvider {
  /**
   * Abstracted method to send emails.
   * In V1, this mocks the delivery. Future implementations can wire Resend/SMTP here.
   */
  public async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`[EmailProvider] Sending Email to ${to}`);
    console.log(`[EmailProvider] Subject: ${subject}`);
    console.log(`[EmailProvider] Body length: ${body.length}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true; // Simulate success
  }
}
