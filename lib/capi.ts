import crypto from 'crypto';

export const sendCapiEvent = async (
  eventName: string,
  pixelId: string,
  token: string,
  userData: {
    email?: string;
    clientIp?: string;
    userAgent?: string;
    userId?: string;
  },
  customData: any
) => {
  if (!pixelId || !token) return;

  const hashData = (data: string) => {
    if (!data) return '';
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  };

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        user_data: {
          client_ip_address: userData.clientIp || "0.0.0.0",
          client_user_agent: userData.userAgent || "",
          em: userData.email ? [hashData(userData.email)] : undefined,
          external_id: userData.userId ? [hashData(userData.userId)] : undefined,
        },
        custom_data: customData,
      }
    ]
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Facebook CAPI Error:', JSON.stringify(errorData));
    }
  } catch (error) {
    console.error('Failed to send CAPI event:', error);
  }
};
