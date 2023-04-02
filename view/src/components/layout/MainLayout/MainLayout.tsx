import { Header, SideNavi } from '@/components/screen'

import { MainLayoutProps } from './MainLayout.types'

export const MainLayout: React.FC<MainLayoutProps> = ({ children }: MainLayoutProps) => (
  <div>
    <Header />
      <div className='relative flex h-screen flex-row'>
        <SideNavi />
        <div className='flex-1'>{children}</div>
      </div>
  </div>
)

export default MainLayout
