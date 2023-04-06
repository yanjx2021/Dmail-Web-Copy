
export interface ChatInfo {
    chatName: string
    lastMessage?: string
    chatId: number
}

export type ChatIndexList = Map<number, ChatInfo>