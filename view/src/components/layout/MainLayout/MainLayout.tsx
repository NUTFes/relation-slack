import { Header, SideNavi } from '@/components/screen'

import { MainLayoutProps } from './MainLayout.types'

export const MainLayout: React.FC<MainLayoutProps> = ({ children }: MainLayoutProps) => (
  <div>
    <Header />
    <main>
      <div className='relative flex h-screen flex-row'>
        <SideNavi />
        <div className='bg-main flex-1'>{children}</div>
      </div>
    </main>
  </div>
)

export default MainLayout
