import { useEffect, useRef, useState, useMemo } from 'react'
import { AiOutlineMenu } from 'react-icons/ai'
import { useRecoilState } from 'recoil'

import { channelState } from '@/store/channel'
import { Message } from '@/type/message.types'
import { get } from '@/utils/api_methods'

import { HeaderProps } from './Header.types'

export const Header: React.FC<HeaderProps> = ({ onToggleSideNavi }: HeaderProps) => {
  const [isFocus, setIsFocus] = useState(false)
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [, setChannel] = useRecoilState(channelState)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CSR_API_URI) throw new Error('CSR_API_URI is not defined.')
    const messagesUrl = `${process.env.NEXT_PUBLIC_CSR_API_URI}/data`
    get(messagesUrl).then((res) => {
      setMessages(res as Message[])
    })
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
      <div className='flex h-20 flex-col items-start justify-around bg-header px-3 text-xl font-bold text-white md:h-16 md:flex-row md:items-center md:justify-between md:px-10'>
        <div className='flex items-center gap-5'>
          <button type='button' onClick={onToggleSideNavi}>
            <AiOutlineMenu />
          </button>
          <h1>渉外局Slackログ</h1>
        </div>
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
          <div className='h-2/3 w-9/10 rounded-lg bg-white p-5 md:h-1/2 md:w-1/2'>
            <div className='flex items-center gap-3'>
              <p className='font-bold'>検索内容:</p>
              <p className='text-xl'>{value || '入力中...'}</p>
            </div>
            <div className='flex items-center gap-3'>
              <p className='font-bold'>一致件数:</p>
              <p className='text-xl'>{searchMessages.length || 'なし'}</p>
            </div>
            <div className='h-4/5 w-full overflow-y-scroll md:h-full '>
              {searchMessages.map((message, index) => (
                <button
                  type='button'
                  key={index}
                  onClick={() => {
                    setChannel({ id: message.channelId, name: message.channelName })
                    setValue('')
                  }}
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
