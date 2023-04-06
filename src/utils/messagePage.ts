// 定义有关消息页面的一些类型
export interface Message {
    isRight: boolean,
    text: string,
    timestamp: number,
    inChatId: number,
    senderId: number,
    hasSend?: boolean,
    
}

export interface Chat {
    chatId: number,
    chatName?: string
    messages: Message[],
}

export type ChatList = Map<number, Chat>
