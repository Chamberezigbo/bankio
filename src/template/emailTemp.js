const transferNotificationTemplate = (
  name,
  transferDetailsHtml,
  emailMessage
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shulioo Transfer Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 0; background-color: #f5f7fa; color: #111827; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 20px; background-color: #f5f7fa;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="40" valign="middle">
                    <svg width="40" height="40" viewBox="0 0 24 24" style="fill: #00c853;">
                      <path d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10s10-4.48 10-10S17.52,2 12,2z M12,20c-4.41,0 -8,-3.59 -8,-8s3.59,-8 8,-8s8,3.59 8,8S16.41,20 12,20z"></path>
                      <path d="M15,6.5l-3,3l-3,-3l-1.5,1.5l3,3l-3,3l1.5,1.5l3,-3l3,3l1.5,-1.5l-3,-3l3,-3z"></path>
                    </svg>
                  </td>
                  <td style="padding-left: 10px; vertical-align: middle;">
                    <span style="color: #4a5568; font-weight: 600; font-size: 20px;">Shulioo</span>
                    <span style="color: #4a5568; font-weight: 400; font-size: 20px;">App</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 24px; color: #111827; line-height: 1.3;">${emailMessage}</h1>
              
              <p style="margin-bottom: 24px; font-size: 16px; color: #111827;">Hello ${name},</p>
              
              <p style="margin-bottom: 24px; font-size: 16px; color: #111827;">Below are your transfer details:</p>
              
              <div style="margin-bottom: 24px; font-size: 16px; color: #111827;">
                ${transferDetailsHtml}
              </div>
              
              <div style="margin-top: 32px;">
                <p style="margin-bottom: 8px; font-size: 16px; color: #111827;">Best regards,</p>
                <p style="margin-bottom: 0; font-size: 16px; color: #111827;">Shulioo Team</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #f1f5f9; font-size: 14px; color: #4b5563;">
              <p style="margin-top: 0; margin-bottom: 16px;">
                Need help? <a href="#" style="color: #00c853; text-decoration: none;">Contact our support team</a> or no longer interested in our newsletters? <a href="#" style="color: #00c853; text-decoration: none;">Unsubscribe here</a>. Want to give us feedback? Let us know what you think on our <a href="#" style="color: #00c853; text-decoration: none;">feedback site</a>.
              </p>
              
              <!-- Social Icons -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right: 16px;">
                    <a href="#" style="display: inline-block; width: 24px; height: 24px; background-color: #cbd5e1; border-radius: 4px; text-align: center; vertical-align: middle;">
                      <svg width="16" height="16" viewBox="0 0 24 24" style="fill: #4b5563; margin-top: 4px;">
                        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"></path>
                      </svg>
                    </a>
                  </td>
                  <td style="padding-right: 16px;">
                    <a href="#" style="display: inline-block; width: 24px; height: 24px; background-color: #cbd5e1; border-radius: 4px; text-align: center; vertical-align: middle;">
                      <svg width="16" height="16" viewBox="0 0 24 24" style="fill: #4b5563; margin-top: 4px;">
                        <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"></path>
                      </svg>
                    </a>
                  </td>
                  <td style="padding-right: 16px;">
                    <a href="#" style="display: inline-block; width: 24px; height: 24px; background-color: #cbd5e1; border-radius: 4px; text-align: center; vertical-align: middle;">
                      <svg width="16" height="16" viewBox="0 0 24 24" style="fill: #4b5563; margin-top: 4px;">
                        <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"></path>
                      </svg>
                    </a>
                  </td>
                  <td>
                    <a href="#" style="display: inline-block; width: 24px; height: 24px; background-color: #cbd5e1; border-radius: 4px; text-align: center; vertical-align: middle;">
                      <svg width="16" height="16" viewBox="0 0 24 24" style="fill: #4b5563; margin-top: 4px;">
                        <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"></path>
                      </svg>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = transferNotificationTemplate;