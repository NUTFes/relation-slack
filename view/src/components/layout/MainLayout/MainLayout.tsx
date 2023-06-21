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
      <div className='relative flex flex-row'>
        <div className={`${isSideNaviOpen ? 'block' : 'hidden'}`}>
          <div className='hidden h-full md:block'>
            <SideNavi />
          </div>
          <div className='h-full md:hidden'>
            <SideNavi onClose={() => setIsSideNaviOpen(false)} />
          </div>
        </div>
        <div className='flex-1'>{children}</div>
      </div>
    </div>
  )
}

export default MainLayout
