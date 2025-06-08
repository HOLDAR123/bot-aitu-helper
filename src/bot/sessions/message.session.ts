const userMessages = new Map<number, number>();

export function setLastMessageId(userId: number, messageId: number) {
    userMessages.set(userId, messageId);
}

export function getLastMessageId(userId: number): number | undefined {
    return userMessages.get(userId);
}

export function clearLastMessage(userId: number) {
    userMessages.delete(userId);
}
