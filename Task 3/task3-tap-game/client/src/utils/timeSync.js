/**
 * Clock synchronization utility using NTP-style offset calculation
 * Ensures all players see the same server time despite network latency
 */

let clockOffset = 0; // ms difference between client and server clocks

/**
 * Synchronize client clock with server
 * Measures round-trip time and calculates offset
 *
 * @param {Socket} socket - socket.io socket instance
 * @returns {Promise<number>} clockOffset in milliseconds
 */
export function syncClock(socket) {
  return new Promise((resolve) => {
    const sentAt = Date.now();
    socket.emit("time_sync_request", { sentAt });

    socket.once("time_sync_response", ({ serverTime, sentAt }) => {
      const rtt = Date.now() - sentAt;
      clockOffset = serverTime - (sentAt + rtt / 2);
      console.log(`⏱️  Clock synced: offset=${clockOffset}ms, RTT=${rtt}ms`);
      resolve(clockOffset);
    });
  });
}

/**
 * Get the current server time on the client
 * Accounts for the measured clock offset
 *
 * @returns {number} server timestamp in milliseconds
 */
export function getServerTime() {
  return Date.now() + clockOffset;
}
