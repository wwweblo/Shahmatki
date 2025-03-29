import React, { ReactNode } from 'react'
import Header from "@/components/header";

const Layout = ({children}: {children:ReactNode}) => {
  return (
    <main>
        <Header />
        {children}
    </main>
  )
}

export default Layout