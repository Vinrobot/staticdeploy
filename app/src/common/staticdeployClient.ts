import StaticdeployClient from "@staticdeploy/sdk";

import { API_URL } from "../config";
import authTokenService from "./authTokenService";

const staticdeployClient = new StaticdeployClient({
    apiUrl: API_URL,
    apiToken: authTokenService.getStatus().authToken || undefined
});

authTokenService.onStatusChange(status => {
    staticdeployClient.setApiToken(status.authToken);
});

export default staticdeployClient;
