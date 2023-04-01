import axios, { AxiosResponse } from 'axios'
import { NextPage } from 'next'
import { useMemo, useRef, useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import { channelState } from '@/store/channel'
import { Message } from '@/type/message.types'

interface Props {
  messages: Message[]
}

export const getServerSideProps = async () => {
  if (!process.env.SSR_API_URI) throw new Error('SSR_API_URI is not defined.')
  const messagesUrl = `${process.env.SSR_API_URI}/data`
  const messages = await axios.get(messagesUrl).then((res: AxiosResponse<Message[]>) => res)
  return {
    props: {
      messages: messages.data,
    },
  }
}

export const Page: NextPage<Props> = ({ messages }: Props) => {
  const channel = useRecoilValue(channelState)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { current: scrollElement } = scrollRef
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [])

  const filteredMessages = useMemo(() => {
    const filtered = messages.filter((message) => message.channelId === channel.id)
    const grouped = filtered.reduce((acc, message) => {
      const date = new Date(Number(message.eventTs) * 1000).toLocaleDateString()
      if (!acc[date]) acc[date] = []
      const messageTime = new Date(Number(message.eventTs) * 1000).toLocaleTimeString()
      acc[date].push({ ...message, eventTs: messageTime })
      return acc
    }, {} as { [key: string]: Message[] })

    return Object.keys(grouped).map((key) => ({ date: key, messages: grouped[key] }))
  }, [messages, channel])

  return (
    <main className='h-full w-full'>
      <div className='items-cen flex gap-2 border-b-2 border-gray-300 p-2 text-xl'>
        <p>#</p>
        <p suppressHydrationWarning>{channel.name}</p>
      </div>
      <div className='mt-5 flex flex-col gap-3'>
        {filteredMessages.length === 0 && (
          <div className='rounded-md px-3 hover:bg-gray-200'>
            <p>メッセージはありません</p>
          </div>
        )}
        <div ref={scrollRef} className='h-full w-full overflow-y-scroll'>
          {filteredMessages.map((messages, index) => (
            <div key={index}>
              <div>
                <p className='mx-auto w-fit translate-y-1/2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-bold'>
                  {messages.date}
                </p>
                <hr className='mb-10' />
              </div>
              {messages.messages.map((message, index) => (
                <div key={index} className='rounded-md px-3 py-1 hover:bg-gray-200'>
                  <div key={index} className='flex items-center gap-2'>
                    <p className='text-sm font-bold'>{message.user}</p>
                    <p className='text-xs'>{message.eventTs}</p>
                  </div>
                  <p>{message.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Page
