import NavbarCombined from '@/components/NavbarCombined'
import React from 'react'

const Layout = ({ children } : { children: React.ReactNode}) => {
  return (
    <div>
        <NavbarCombined />
        <main
         className="pt-32"
        >
            {children}
        </main>
    </div>
  )
}

export default Layout