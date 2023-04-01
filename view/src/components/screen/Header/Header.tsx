import axios, { AxiosResponse } from 'axios'
import { useEffect, useRef, useState, useMemo } from 'react'

import { Message } from '@/type/message.types'

export const Header: React.FC = () => {
  const [isFocus, setIsFocus] = useState(false)
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!process.env.CSR_API_URI) throw new Error('CSR_API_URI is not defined.')
    const messagesUrl = `${process.env.CSR_API_URI}/data`
    axios.get(messagesUrl).then((res: AxiosResponse<Message[]>) => setMessages(res.data))
  }, [])

  const searchMessages = useMemo(() => {
    if (!value) return []
    const filtered = messages.filter(
      (message) => message.text.includes(value) || message.user.includes(value) || message.channelName.includes(value),
    )
    const unixToDateMessages = filtered.map((message) => ({
      ...message,
      eventTs: new Date(Number(message.eventTs) * 1000).toLocaleString(),
    }))
    return unixToDateMessages
  }, [value, messages])

  useEffect(() => {
    const { current: inputElement } = inputRef
    if (inputElement) {
      inputElement.addEventListener('focus', () => {
        setIsFocus(true)
      })
      inputElement.addEventListener('blur', () => {
        setIsFocus(false)
      })
    }
  }, [])

  return (
    <>
      <div className='flex h-16 flex-row items-center justify-between bg-header px-10 text-xl font-bold text-white'>
        <h1>渉外局Slackログ</h1>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className='rounded-lg bg-gray-200 p-2 text-sm text-black'
          placeholder='検索'
        />
      </div>
      <div
        className={`${
          isFocus ? 'visible' : 'invisible opacity-0'
        } fixed left-0 top-0 z-30 h-full w-full bg-black bg-opacity-50 transition-all`}
      >
        <div className='flex h-full w-full items-center justify-center'>
          <div className='h-1/2 w-1/2 rounded-lg bg-white p-5'>
            <div className='flex items-center gap-3'>
              <p className='font-bold'>検索内容:</p>
              <p className='text-xl'>{value || '入力中...'}</p>
            </div>
            <div className='flex items-center gap-3'>
              <p className='font-bold'>一致件数:</p>
              <p className='text-xl'>{searchMessages.length || 'なし'}</p>
            </div>
            <div className='h-4/5 w-full mt-3 overflow-y-scroll '>
              {searchMessages.map((message, index) => (
                <button
                  type='button'
                  key={index}
                  className='flex w-full flex-col items-start rounded-md px-3 py-1 hover:bg-gray-200'
                >
                  <p className='font-bold'>{`# ${message.channelName}`}</p>
                  <div key={index} className='flex items-center gap-2'>
                    <p className='text-sm font-bold'>{message.user}</p>
                    <p className='text-xs'>{message.eventTs}</p>
                  </div>
                  <p>{message.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
