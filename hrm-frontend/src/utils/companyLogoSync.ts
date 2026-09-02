import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const COMPANY_LOGO_UPDATED_EVENT = 'company-logo-updated';

export const notifyCompanyLogoUpdated = (companyId: string | number | null) => {
  if (!companyId) return;

  const payload = {
    companyId: String(companyId),
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(COMPANY_LOGO_UPDATED_EVENT, JSON.stringify(payload));
  } catch {
    // no-op
  }

  window.dispatchEvent(
    new CustomEvent(COMPANY_LOGO_UPDATED_EVENT, { detail: payload })
  );

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('company-logo-updated');
    channel.postMessage(payload);
    channel.close();
  }
};

export const subscribeCompanyLogoUpdates = (
  companyId: string | null,
  callback: () => void
) => {
  if (!companyId) return () => {};

  const handleUpdate = (event: Event) => {
    const detail = (event as CustomEvent<{ companyId?: string }>).detail;
    const payload = detail ?? JSON.parse(localStorage.getItem(COMPANY_LOGO_UPDATED_EVENT) || 'null');

    if (!payload || String(payload.companyId) !== String(companyId)) {
      return;
    }

    callback();
  };

  window.addEventListener(COMPANY_LOGO_UPDATED_EVENT, handleUpdate);

  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel('company-logo-updated');
    channel.onmessage = (event) => {
      const payload = event.data;
      if (String(payload?.companyId) === String(companyId)) {
        callback();
      }
    };
  }

  return () => {
    window.removeEventListener(COMPANY_LOGO_UPDATED_EVENT, handleUpdate);
    channel?.close();
  };
};

export const subscribeCompanyLogoWebSocket = (
  companyId: string | null,
  callback: () => void
) => {
  if (!companyId) return () => {};

  const token = localStorage.getItem('token');
  if (!token) return () => {};

  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = () => {
    client.subscribe(`/topic/company/${companyId}`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        if (data?.type === 'COMPANY_LOGO_UPDATED' || String(data?.companyId) === String(companyId)) {
          notifyCompanyLogoUpdated(companyId);
          callback();
        }
      } catch {
        // no-op
      }
    });
  };

  client.activate();

  return () => {
    if (client.connected) {
      client.deactivate();
    }
  };
};
