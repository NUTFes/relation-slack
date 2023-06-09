import { NextPage } from 'next'
import { useRef, useEffect, useState } from 'react'
import { AiOutlineCaretDown } from 'react-icons/ai'
import { GrFormClose } from 'react-icons/gr'
import { useRecoilValue } from 'recoil'

import { channelState } from '@/store/channel'
import { Message, FilteredMessage } from '@/type/message.types'
import { get } from '@/utils/api_methods'

interface Props {
  messages: Message[]
  users: { [key: string]: string }
}

export const getServerSideProps = async () => {
  if (!process.env.NEXT_PUBLIC_SSR_API_URI) throw new Error('SSR_API_URI is not defined.')
  const messagesUrl = `${process.env.NEXT_PUBLIC_SSR_API_URI}/data`
  const messages = await get(messagesUrl)
  const usersUrl = `${process.env.NEXT_PUBLIC_SSR_API_URI}/users/info`
  const users = (await get(usersUrl)) as Array<object>
  const userData = users[0]
  return {
    props: {
      messages,
      users: userData,
    },
  }
}

const SearchBox = ({
  startDate,
  onSetStartDate,
  endDate,
  onSetEndDate,
  onClearDate,
}: {
  startDate: string
  onSetStartDate: (value: string) => void
  endDate: string
  onSetEndDate: (value: string) => void
  onClearDate: () => void
}) => (
  <div className='flex flex-row items-center justify-between gap-2'>
    <p className='text-sm'>期間</p>
    <div className='flex flex-row flex-wrap items-center gap-3'>
      <input
        type='date'
        value={startDate}
        onChange={(e) => onSetStartDate(e.target.value)}
        className='rounded-lg border border-gray-300 p-1 text-sm'
      />
      <p>~</p>
      <input
        type='date'
        value={endDate}
        onChange={(e) => onSetEndDate(e.target.value)}
        className='rounded-lg border border-gray-300 p-1 text-sm'
      />
      <div className='rounded-md border border-gray-400'>
        <GrFormClose className='cursor-pointer' onClick={onClearDate} />
      </div>
    </div>
  </div>
)

export const Page: NextPage<Props> = ({ messages, users }: Props) => {
  const channel = useRecoilValue(channelState)
  const [channelName, setChannelName] = useState<string>('')
  const [filteredMessages, setFilteredMessages] = useState<FilteredMessage[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState<boolean>(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const replaceUserName = (text: string) => {
    const regex = /<@.+?>/g
    const matches = text.match(regex)
    if (!matches) return text
    const replaced = matches.map((match) => {
      const userId = match.replace(/<|@|>/g, '')
      const user: string = users[userId]
      if (!user) return match
      return `@${user} `
    })
    return replaced.reduce((acc, replace, index) => acc.replace(matches[index], replace), text)
  }

  useEffect(() => {
    const filtered = messages.filter((message) => message.channelId === channel.id)
    const filteredByTime = Array.from(new Set(filtered.map((message) => message.eventTs)))
      .map((eventTs) => filtered.find((message) => message.eventTs === eventTs))
      .sort((a, b) => {
        if (a && b) {
          return Number(a.eventTs) - Number(b.eventTs)
        }
        return 0
      })
    const grouped = filteredByTime.reduce((acc, message) => {
      if (!message) return acc
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
    <main className='flex h-full flex-col'>
      <div className='flex flex-col items-start justify-around gap-3 border-b-2 border-gray-300 px-4 py-2 text-xl md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <p>#</p>
            <p>{channelName}</p>
          </div>
          <button
            type='button'
            className='rounded-md border border-gray-400 p-1 text-sm md:hidden'
            onClick={() => setIsSearchBoxOpen(!isSearchBoxOpen)}
          >
            <AiOutlineCaretDown />
          </button>
        </div>
        <div
          className={`flex flex-col items-center gap-2 md:block md:flex-row ${isSearchBoxOpen ? 'block' : 'hidden'}`}
        >
          <SearchBox
            startDate={startDate}
            onSetStartDate={setStartDate}
            endDate={endDate}
            onSetEndDate={setEndDate}
            onClearDate={() => {
              setStartDate('')
              setEndDate('')
            }}
          />
        </div>
      </div>
      <div className='h-4/5 border-b border-gray-300'>
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
                <div key={index} className='max-w-[100vw] rounded-md px-3 py-1 hover:bg-gray-200'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-bold'>{message.user}</p>
                    <p className='text-xs'>{message.eventTs}</p>
                  </div>
                  <p className='w-full break-words'>{replaceUserName(message.text)}</p>
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
