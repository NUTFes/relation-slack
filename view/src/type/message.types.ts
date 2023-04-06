export interface Message {
  channelId: string
  channelName: string
  eventTs: string
  text: string
  user: string
}

export interface FilteredMessage {
  date: string
  messages: Message[]
}
