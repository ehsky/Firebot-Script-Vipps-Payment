import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { initLogger } from "./logger";
import { setConfig } from "./vippsPayment";
import appVersion from "./appVersion.json";

interface Params {
  client_id: string;
  client_secret: string;
  merchantSerialNumber: string;
  ocpApiSubscriptionKey: string;
  baseUrl: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: appVersion.scriptOutputName,
      description: appVersion.description,
      author: appVersion.author,
      version: appVersion.version,
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      client_id: {
        type: "string",
        default: "",
        description: "Client ID",
        secondaryDescription: "Enter the client ID here",
      },
      client_secret: {
        type: "string",
        default: "",
        description: "Client Secret",
        secondaryDescription: "Enter the client secret here",
      },
      merchantSerialNumber: {
        type: "string",
        default: "",
        description: "Merchant Serial Number",
        secondaryDescription: "Enter the merchant serial number here",
      },
      ocpApiSubscriptionKey: {
        type: "string",
        default: "",
        description: "Ocp-Api-Subscription-Key",
        secondaryDescription: "Enter the Ocp-Api-Subscription-Key here",
      },
      baseUrl: {
        type: "string",
        default: "https://apitest.vipps.no",
        description: "Base URL",
        secondaryDescription: "Enter the base URL here",
      },
    };
  },
  run: (runRequest) => {
    const { logger } = runRequest.modules;
    initLogger(logger);
    logger.info(runRequest.parameters.merchantSerialNumber);
    setConfig({
      baseUrl: runRequest.parameters.baseUrl,
      client_id: runRequest.parameters.client_id,
      client_secret: runRequest.parameters.client_secret,
      merchantSerialNumber: runRequest.parameters.merchantSerialNumber,
      Ocp_Apim_Subscription_Key: runRequest.parameters.ocpApiSubscriptionKey,
      vipps_system_name: "Firebot",
      vipps_system_version: "2.0",
      vipps_system_plugin_name: appVersion.scriptOutputName,
      vipps_system_plugin_version: appVersion.version,
    });
  },
};

export default script;
