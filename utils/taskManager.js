const axios = require("axios");
const https = require("https");
const { logWithColor } = require("./logger");

async function getWalletTasks(walletId, options) {
    const { userAgent, proxy, proxyManager, walletDisplayId } = options;

    try {
        const requestConfig = {
            method: "get",
            url: `https://api.meganet.app/wallets/task/${walletId}`,
            headers: {
                "User-Agent": userAgent,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            timeout: 30000,
        };

        if (proxy && proxyManager) {
            const httpsAgent = proxyManager(proxy, walletDisplayId);
            if (httpsAgent) {
                requestConfig.httpsAgent = httpsAgent;
                requestConfig.httpAgent = false;
                requestConfig.protocol = "https:";
            }
        } else {
            requestConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
        }

        logWithColor(walletDisplayId, `Getting task list for wallet`, "info");
        const response = await axios(requestConfig);

        if (response.status === 200) {
            logWithColor(walletDisplayId, `Successfully got task list`, "success");
            return { success: true, tasks: response.data };
        } else {
            logWithColor(walletDisplayId, `Error getting tasks: ${response.status}`, "error");
            return { success: false, error: `HTTP error: ${response.status}` };
        }
    } catch (error) {
        if (error.response) {
            logWithColor(walletDisplayId, `Error getting tasks: ${error.message}`, "error");
            logWithColor(walletDisplayId, `Response status: ${error.response.status}`, "error");
            return { success: false, error: error.message, status: error.response.status };
        } else if (error.request) {
            logWithColor(walletDisplayId, `Error getting tasks: No response`, "error");
            return { success: false, error: "No response from server" };
        } else {
            logWithColor(walletDisplayId, `Error getting tasks: ${error.message}`, "error");
            return { success: false, error: error.message };
        }
    }
}

async function completeTask(walletId, taskName, options) {
    const { userAgent, proxy, proxyManager, walletDisplayId } = options;

    try {
        const requestConfig = {
            method: "patch",
            url: `https://api.meganet.app/wallets/task/${walletId}/${taskName}`,
            headers: {
                "User-Agent": userAgent,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            timeout: 30000,
        };

        if (proxy && proxyManager) {
            const httpsAgent = proxyManager(proxy, walletDisplayId);
            if (httpsAgent) {
                requestConfig.httpsAgent = httpsAgent;
                requestConfig.httpAgent = false;
                requestConfig.protocol = "https:";
            }
        } else {
            requestConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
        }

        logWithColor(walletDisplayId, `Executing task "${taskName}"`, "task");
        const response = await axios(requestConfig);

        if (response.status === 200) {
            logWithColor(walletDisplayId, `Task "${taskName}" completed successfully`, "success");
            return { success: true, data: response.data };
        } else {
            logWithColor(walletDisplayId, `Error completing task "${taskName}": ${response.status}`, "error");
            return { success: false, error: `HTTP error: ${response.status}` };
        }
    } catch (error) {
        if (error.response) {
            logWithColor(walletDisplayId, `Error completing task "${taskName}": ${error.message}`, "error");
            logWithColor(walletDisplayId, `Response status: ${error.response.status}`, "error");
            return { success: false, error: error.message, status: error.response.status };
        } else if (error.request) {
            logWithColor(walletDisplayId, `Error completing task "${taskName}": No response`, "error");
            return { success: false, error: "No response from server" };
        } else {
            logWithColor(walletDisplayId, `Error completing task "${taskName}": ${error.message}`, "error");
            return { success: false, error: error.message };
        }
    }
}

async function handleTasks(walletId, options) {
    const { walletDisplayId } = options;

    try {
        const tasksResult = await getWalletTasks(walletId, options);

        if (!tasksResult.success) {
            logWithColor(walletDisplayId, `Failed to get tasks, skipping processing`, "warning");
            return { success: false, error: tasksResult.error };
        }

        const tasks = tasksResult.tasks;
        const completedTasks = [];
        const failedTasks = [];

        for (const [taskName, isCompleted] of Object.entries(tasks)) {
            if (taskName === "_id" || taskName === "__v") continue;

            if (isCompleted === false) {
                logWithColor(walletDisplayId, `Found incomplete task: ${taskName}`, "info");

                const delay = Math.floor(Math.random() * 3000) + 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));

                const result = await completeTask(walletId, taskName, options);

                if (result.success) {
                    completedTasks.push(taskName);
                } else {
                    failedTasks.push({ taskName, error: result.error });
                }
            }
        }

        return {
            success: true,
            completedTasks,
            failedTasks,
            totalCompleted: completedTasks.length,
            totalFailed: failedTasks.length,
        };
    } catch (error) {
        logWithColor(walletDisplayId, `Error processing tasks: ${error.message}`, "error");
        return { success: false, error: error.message };
    }
}

module.exports = {
    getWalletTasks,
    completeTask,
    handleTasks,
};
