import axios, { AxiosResponse } from 'axios'
import { NextPage } from 'next'
import { useRef, useEffect, useState } from 'react'
import { GrFormClose } from 'react-icons/gr'
import { useRecoilValue } from 'recoil'

import { MainLayout } from '@/components/layout/MainLayout'
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
  const [channelName, setChannelName] = useState<string>('')
  const [filteredMessages, setFilteredMessages] = useState<{ date: string; messages: Message[] }[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const filtered = messages.filter((message) => message.channelId === channel.id)
    const grouped = filtered.reduce((acc, message) => {
      const date = new Date(Number(message.eventTs) * 1000).toLocaleDateString()
      if (!acc[date]) acc[date] = []
      const messageTime = new Date(Number(message.eventTs) * 1000).toLocaleTimeString()
      acc[date].push({ ...message, eventTs: messageTime })
      return acc
    }, {} as { [key: string]: Message[] })

    if (startDate || endDate) {
      if (!startDate) {
        setStartDate('1970-01-01')
      }
      if (!endDate) {
        setEndDate(new Date().toISOString().split('T')[0])
      }
      const start = new Date(startDate).getTime() / 1000 - 86400
      const end = new Date(endDate).getTime() / 1000
      const filteredByDate = Object.keys(grouped).reduce((acc, key) => {
        const date = new Date(key).getTime() / 1000
        if (date >= start && date <= end) {
          acc[key] = grouped[key]
        }
        return acc
      }, {} as { [key: string]: Message[] })
      return setFilteredMessages(
        Object.keys(filteredByDate).map((key) => ({ date: key, messages: filteredByDate[key] })),
      )
    }

    setFilteredMessages(Object.keys(grouped).map((key) => ({ date: key, messages: grouped[key] })))
  }, [messages, channel.id, startDate, endDate])

  useEffect(() => {
    if (channelName !== channel.name) {
      setChannelName(channel.name)
    }
  }, [channel.name, channelName])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredMessages])

  return (
    <main>
      <MainLayout>
        <div className='h-screen w-full'>
          <div className='flex items-center justify-between border-b-2 border-gray-300 px-4 py-2 text-xl'>
            <div className='flex items-center gap-2'>
              <p>#</p>
              <p>{channelName}</p>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-sm'>期間</p>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='rounded-lg border border-gray-300 p-1 text-sm'
              />
              <p>~</p>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='rounded-lg border border-gray-300 p-1 text-sm'
              />
              <div className='border border-gray-400 rounded-md'>
                <GrFormClose
                  className='cursor-pointer'
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                />
              </div>
            </div>
          </div>
          <div className='mt-5 h-3/4 w-full border-b border-gray-300'>
            {filteredMessages.length === 0 && (
              <div className='rounded-md px-3 hover:bg-gray-200'>
                <p>メッセージはありません</p>
              </div>
            )}
            <div ref={scrollRef} className='h-full w-full overflow-y-scroll'>
              {filteredMessages.map((messages, index) => (
                <div key={index}>
                  <p className='mx-auto w-fit translate-y-1/2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-bold'>
                    {messages.date}
                  </p>
                  <hr className='mb-10' />
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
        </div>
      </MainLayout>
    </main>
  )
}

export default Page
