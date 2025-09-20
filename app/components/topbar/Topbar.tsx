"use  client"
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass'
import React from 'react'

const Topbar = () => {
  return (
    <div className='h-[84px] shrink-0 border-b-2 border-border p-4 flex' >
        {/* <div className='' ></div> */}
        <div className='h-full w-[350px] bg-white rounded-lg group border-2 focus-within:border-accent transition-colors duration-150 border-border flex relative' >
            <MagnifyingGlass weight="bold" size={20} className='text-zinc-500 group-focus-within:text-accent h-full mx-3 absolute aspect-square pointer-events-none shrink-0' />
            <input type="text" className='size-full outline-none pl-10 text-xl font-medium' placeholder='Search' />
        </div>
    </div>
  )
}

export default Topbar