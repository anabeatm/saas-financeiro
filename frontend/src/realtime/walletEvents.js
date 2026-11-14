import { formatCurrency } from "../utils/format";

export const TRANSACTION_EVENTS = [
  "TRANSACTION_CREATED",
  "TRANSACTION_UPDATED",
  "TRANSACTION_DELETED",
];

// Text of the notification shown to the other members. `me` is the id of the signed-in user.
export const describeWalletEvent = (event, me) => {
  const who = event.actorName;
  const wallet = `"${event.walletName}"`;
  const kind = event.transactionType === "INCOME" ? "an income" : "an expense";
  const amount = event.amount != null ? ` of ${formatCurrency(event.amount)}` : "";
  const isMe = event.affectedUserId === me;

  switch (event.type) {
    case "TRANSACTION_CREATED":
      return `${who} added ${kind}${amount} to ${wallet}`;
    case "TRANSACTION_UPDATED":
      return `${who} edited ${kind}${amount} in ${wallet}`;
    case "TRANSACTION_DELETED":
      return `${who} deleted ${kind}${amount} from ${wallet}`;
    case "WALLET_UPDATED":
      return `${who} updated the wallet ${wallet}`;
    case "WALLET_DELETED":
      return `${who} deleted the wallet ${wallet}`;
    case "MEMBER_ADDED":
      return isMe ? `${who} added you to ${wallet}` : `${who} added a member to ${wallet}`;
    case "MEMBER_ROLE_CHANGED":
      return isMe
        ? `${who} changed your role in ${wallet}`
        : `${who} changed a member's role in ${wallet}`;
    case "MEMBER_REMOVED":
      return isMe
        ? `${who} removed you from ${wallet}`
        : `${who} removed a member from ${wallet}`;
    default:
      return `${wallet} was updated`;
  }
};
