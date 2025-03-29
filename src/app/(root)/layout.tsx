import React, { ReactNode } from 'react'
import Header from "@/components/header";

const Layout = ({children}: {children:ReactNode}) => {
  return (
    <main className='flex flex-col gap-5'>
        <Header />
        {children}
    </main>
  )
}

export default Layout