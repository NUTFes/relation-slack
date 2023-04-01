// 現在指定したchannelをrecoilで管理する
import { atom } from 'recoil'
import { recoilPersist } from 'recoil-persist'

import { Channel } from '@/type/channel.types'

const { persistAtom } = recoilPersist()

export const channelState = atom<Channel>({
  key: 'channelState',
  default: {
    id: '',
    name: '',
  },
  effects_UNSTABLE: [persistAtom],
})
