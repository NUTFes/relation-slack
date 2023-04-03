import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

import { channelState } from '@/store/channel'
import { Channel } from '@/type/channel.types'
import { get } from '@/utils/api_methods'

export const SideNavi: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [, setChannel] = useRecoilState(channelState)

  useEffect(() => {
    const channelUrl = `${process.env.NEXT_PUBLIC_CSR_API_URI || ''}/channel/info`
    const fetchChannel = async () => {
      const res = await get(channelUrl)
      const dataObject = res as Array<object>
      const data = dataObject[0] as { [key: string]: string }
      const dataArr: Channel[] = Object.keys(data).map((key) => ({ id: key, name: data[key] }))
      dataArr.pop()
      setChannels(dataArr)
    }
    fetchChannel()
  }, [])

  return (
    <div className='absolute z-50 flex h-full w-fit justify-start bg-side text-lg font-thin text-white md:sticky'>
      <div className='my-10 flex w-full flex-col gap-1 px-3'>
        {channels.map((channel, index) => (
          <button
            type='button'
            key={index}
            className='flex w-full items-center gap-3 rounded-lg px-2 py-1 text-sm hover:bg-sideHover'
            onClick={() => setChannel(channel)}
          >
            <p>#</p>
            <p>{channel.name}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SideNavi
