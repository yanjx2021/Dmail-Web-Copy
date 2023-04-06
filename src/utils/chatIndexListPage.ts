
export interface ChatInfo {
    chatName: string
    lastMessage?: string // 别人发的最后一条消息
    lastMessageTimeStamp?: number // 别人发的最后一条消息的时间
    ChatTimeStamp?: number // 整个Chat最后一条消息的时间，如果没有，则为创建的时间
    chatId: number
}

export type ChatIndexList = Map<number, ChatInfo>