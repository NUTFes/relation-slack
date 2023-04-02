import { useState, useEffect } from 'react'

import { Header, SideNavi } from '@/components/screen'

import { MainLayoutProps } from './MainLayout.types'

export const MainLayout: React.FC<MainLayoutProps> = ({ children }: MainLayoutProps) => {
  const [isSideNaviOpen, setIsSideNaviOpen] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSideNaviOpen(false)
      } else {
        setIsSideNaviOpen(true)
      }
    }
    handleResize()
  }, [])

  return (
    <div>
      <Header onToggleSideNavi={() => setIsSideNaviOpen(!isSideNaviOpen)} />
      <div className='relative flex h-screen flex-row'>
        <div className={`${isSideNaviOpen ? 'block' : 'hidden'} h-screen`}>
          <SideNavi />
        </div>
        <div className='flex-1'>{children}</div>
      </div>
    </div>
  )
}

export default MainLayout
