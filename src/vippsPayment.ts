import axios from "axios";
import { logger } from "./logger";

/**
 * The access token for Vipps authentication.
 */
let accessToken: string | null = null;
/**
 * Configuration object for Vipps API.
 */
let config: {
  client_id: string;
  client_secret: string;
  Ocp_Apim_Subscription_Key: string;
  merchantSerialNumber: string;
  vipps_system_name: string;
  vipps_system_version: string;
  vipps_system_plugin_name: string;
  vipps_system_plugin_version: string;
  baseUrl: string;
} | null = null;

/**
 * Sets the configuration for Vipps payment.
 * @param newConfig - The new configuration object.
 */
export function setConfig(newConfig: typeof config) {
  config = newConfig;
}

function getHeaders(includeAccessToken: boolean = true) {
  if (!config) {
    logger.error("Config is not set");
    return null;
  }

  const headers: Record<string, string> = {
    "Merchant-Serial-Number": config.merchantSerialNumber,
    "Ocp-Apim-Subscription-Key": config.Ocp_Apim_Subscription_Key,
    "Vipps-System-Name": config.vipps_system_name,
    "Vipps-System-Version": config.vipps_system_version,
    "Vipps-System-Plugin-Name": config.vipps_system_plugin_name,
    "Vipps-System-Plugin-Version": config.vipps_system_plugin_version,
  };

  if (includeAccessToken && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Initializes the authentication connection with Vipps.
 * This function retrieves the access token and schedules the next token refresh.
 */
export async function initAuthConnection() {
  if (!config) {
    logger.error("Config is not set");
    return;
  }

  const response = await axios.post(
    "https://apitest.vipps.no/accessToken/get",
    {},
    {
      headers: getHeaders(false),
    },
  );

  if (response.status === 200) {
    accessToken = response.data.access_token;
    // Schedule the next token refresh before the current one expires
    setTimeout(
      () => initAuthConnection(),
      (response.data.expires_in - 60) * 1000,
    );
  } else {
    logger.error("Failed to get access token");
  }
}

/**
 * Subscribes to payment events using Vipps webhooks.
 * @param baseUrl - The base URL for the webhooks.
 * @param callbackUrl - The URL to receive the webhook events.
 */
export async function subscribePayment(baseUrl: string, callbackUrl: string) {
  if (!accessToken) {
    logger.error("Access token is not set");
  }

  const body = {
    url: callbackUrl,
    events: ["epayments.payment.captured.v1"],
  };

  const response = await axios.post(`${baseUrl}/webhooks/v1/webhooks`, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status !== 200) {
    logger.error("Failed to subscribe payment");
  }
}

export async function deleteAll() {
  if (!config) {
    logger.error("Config is not set");
    return;
  }

  // Retrieve all webhooks
  const webhooksResponse = await axios.get(
    `${config.baseUrl}/webhooks/v1/webhooks`,
    {
      headers: getHeaders(true),
    },
  );

  if (webhooksResponse.status !== 200) {
    logger.error("Failed to retrieve webhooks");
    return;
  }

  const webhookIds = webhooksResponse.data.webhooks.map(
    (webhook: any) => webhook.id,
  );

  for (let id of webhookIds) {
    console.log(`Deleting ${id}`);

    const response = await axios.delete(
      `${config.baseUrl}/webhooks/v1/webhooks/${id}`,
      {
        headers: getHeaders(true),
      },
    );

    if (response.status !== 204) {
      logger.error(`Failed to delete webhook with id ${id}`);
    }
  }
}
