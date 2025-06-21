const userMessages = new Map<number, number>();

export function setLastMessageId(userId: number, messageId: number) {
    console.debug(`setLastMessageId: userId=${userId}, messageId=${messageId}`);
    userMessages.set(userId, messageId);
}

export function getLastMessageId(userId: number): number | undefined {
    const messageId = userMessages.get(userId);
    console.debug(`getLastMessageId: userId=${userId}, messageId=${messageId}`);
    return messageId;
}

export function clearLastMessage(userId: number) {
    console.debug(`clearLastMessage: userId=${userId}`);
    userMessages.delete(userId);
}
