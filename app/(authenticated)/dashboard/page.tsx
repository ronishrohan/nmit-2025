"use client"
import Button from '@/app/components/ui/button/Button'
import { ArrowClockwise } from '@phosphor-icons/react/dist/ssr/ArrowClockwise'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass'
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus'
import React, { useState } from 'react'

type FilterCardProps = {
  number: number | string
  title: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

const FilterCard = ({ number, title, isSelected, onClick, className }: FilterCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl outline-none border-2 gap-2 px-4 h-full w-fit font-medium cursor-pointer duration-100 text-xl flex items-center justify-between transition-colors 
        ${isSelected ? 'bg-accent-green/40 border-[#B9DDBA] text-black' : 'bg-white hover:bg-zinc-200 border-border text-black/80'} 
        ${className}`}
    >
      <div>{number}</div>
      <div>{title}</div>
    </button>
  )
}

const Page = () => {
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null)

  const filters = [
    { number: 2, title: 'Draft' },
    { number: 5, title: 'Confirmed' },
    { number: 3, title: 'In-Progress' },
    { number: 1, title: 'To Close' },
    { number: 4, title: 'Not Assigned' },
    { number: 6, title: 'Late' },
  ]

  return (
    <div className='h-fit w-full p-4 flex flex-col'>
      {/* Search & Buttons */}
      <div className='w-full flex h-[60px] gap-2'>
        <Button className='px-6 shrink-0'>
          <Plus size={20} weight='regular' /> Create Order
        </Button>
        <div className='h-full w-full bg-white rounded-xl group border-2 focus-within:border-accent transition-colors duration-150 border-border flex relative'>
          <MagnifyingGlass
            weight='bold'
            size={20}
            className='text-zinc-500 group-focus-within:text-accent h-full mx-3 absolute aspect-square pointer-events-none shrink-0'
          />
          <input
            type='text'
            className='size-full outline-none pl-10 text-xl font-medium'
            placeholder='Search'
          />
        </div>
        <Button variant='secondary' className='px-6 shrink-0'>
          <ArrowClockwise size={20} weight='regular' /> Reset
        </Button>
        
      </div>

      {/* Filter Cards */}
      <div className='h-[60px] mt-4 w-full flex gap-2'>
        {filters.map((filter, index) => (
          <FilterCard
            key={index}
            number={filter.number}
            title={filter.title}
            isSelected={selectedFilter === index}
            onClick={() => {
                if(selectedFilter == index){
                    setSelectedFilter(null)
                }
                else{
                    setSelectedFilter(index)
                }
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Page
